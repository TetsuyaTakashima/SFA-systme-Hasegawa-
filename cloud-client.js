(() => {
  const config = window.CRM_SUPABASE_CONFIG || {};
  const apiKey = config.anonKey || config.publishableKey || config.key || "";
  const enabled = Boolean(config.url && apiKey);
  const venueFetchPageSize = 1000;
  const venueUpsertBatchSize = 500;
  const client = !enabled
    ? null
    : window.supabase?.createClient
      ? window.supabase.createClient(config.url, apiKey, {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true,
        },
      })
      : createFetchClient(config.url, apiKey);
  const authEmailDomain = config.authEmailDomain || "crm.local";
  const fetchSessionKey = "culturalVenueCrm.supabaseFetchSession.v1";

  function isEnabled() {
    return enabled;
  }

  function getClient() {
    return client;
  }

  async function getSession() {
    if (!client) return null;
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(loginId, password) {
    if (!client) throw new Error("Supabaseが設定されていません。");
    const email = loginIdToEmail(loginId);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    const profile = await getCurrentProfile(data.session);
    if (!profile?.active) {
      await signOut();
      throw new Error("このアカウントは停止中です。管理者に確認してください。");
    }
    return profile;
  }

  async function signOut() {
    if (!client) return;
    await client.auth.signOut();
  }

  async function getCurrentProfile(session = null) {
    if (!client) return null;
    const currentSession = session || (await getSession());
    const userId = currentSession?.user?.id;
    if (!userId) return null;
    const { data, error } = await client.from("profiles").select("*").eq("id", userId).maybeSingle();
    if (error) throw error;
    return data ? profileToUser(data) : null;
  }

  async function loadWorkspace(userId, options = {}) {
    if (!client) throw new Error("Supabaseが設定されていません。");
    const loadVenues = options.loadVenues !== false;
    const [profiles, statusOptions, temperatureOptions, venues, preferences, currentProfile] = await Promise.all([
      fetchProfiles(),
      fetchStatusOptions(),
      fetchTemperatureOptions(),
      loadVenues ? fetchVenues() : Promise.resolve([]),
      fetchUserPreferences(userId),
      getCurrentProfile(),
    ]);
    const histories = currentProfile?.role === "admin" ? await Promise.all([fetchCallHistories(), fetchAuditEvents()]) : [[], []];

    const venueMap = new Map(venues.map((venue) => [venue.id, venue]));
    return {
      currentUser: currentProfile,
      users: profiles,
      statusOptions: statusOptions.map((item) => item.name),
      statusMeta: Object.fromEntries(statusOptions.map((item) => [item.name, { color: item.color, isClosed: item.isClosed }])),
      temperatureMeta: Object.fromEntries(temperatureOptions.map((item) => [item.level, { label: item.label, color: item.color }])),
      venues,
      preferences,
      callHistory: histories.flat().map((entry) => ({
        ...entry,
        facilityName: venueMap.get(entry.venueId)?.facilityName || entry.facilityName || "名称未設定",
      })),
    };
  }

  async function fetchProfiles() {
    const { data, error } = await client.from("profiles").select("*").order("name", { ascending: true });
    if (error) throw error;
    return (data || []).map(profileToUser);
  }

  async function fetchStatusOptions() {
    const { data, error } = await client
      .from("venue_status_options")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return (data || []).map(statusRowToOption);
  }

  async function fetchTemperatureOptions() {
    const { data, error } = await client
      .from("venue_temperature_options")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("level", { ascending: true });
    if (error) throw error;
    return (data || []).map(temperatureRowToOption);
  }

  async function fetchVenues() {
    const rows = [];
    for (let from = 0; ; from += venueFetchPageSize) {
      const to = from + venueFetchPageSize - 1;
      const { data, error } = await client
        .from("venues")
        .select("*")
        .order("updated_at", { ascending: false })
        .range(from, to);
      if (error) throw error;
      rows.push(...(data || []));
      if (!data || data.length < venueFetchPageSize) break;
    }
    return rows.map(venueRowToVenue);
  }

  async function fetchVenuePage(filters = {}) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(200, Math.max(25, Number(filters.pageSize) || 50));
    const sort = getVenueSort(filters.sort);
    let query = client.from("venues").select("*", { count: "exact" });

    if (filters.status) query = query.eq("status", filters.status);
    if (filters.prefecture) query = query.eq("prefecture", filters.prefecture);
    if (filters.assignee === "__current" && filters.currentUserId) query = query.eq("assigned_user_id", filters.currentUserId);
    if (filters.assignee === "__unassigned") query = query.is("assigned_user_id", null);
    if (filters.assignee && !filters.assignee.startsWith("__")) query = query.eq("assigned_user_id", filters.assignee);
    if (filters.priority) query = query.eq("temperature", filters.priority);
    if (filters.recordType) query = query.eq("record_type", filters.recordType);
    if (filters.visibility === "hidden") query = query.eq("is_hidden", true);
    if (filters.visibility !== "all" && filters.visibility !== "hidden") query = query.eq("is_hidden", false);

    const search = normalizeVenueSearch(filters.search);
    if (search) {
      const pattern = `*${search}*`;
      query = query.or(
        ["facility_name", "category", "operator", "prefecture", "municipality", "address", "phone", "email", "department", "contact_name", "genres", "status", "next_action", "notes"]
          .map((column) => `${column}.ilike.${pattern}`)
          .join(",")
      );
    }

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
      .order("id", { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw error;
    return {
      venues: (data || []).map(venueRowToVenue),
      total: Number.isFinite(Number(count)) ? Number(count) : (data || []).length,
      page,
      pageSize,
    };
  }

  async function fetchVenueById(id) {
    if (!id) return null;
    const { data, error } = await client.from("venues").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? venueRowToVenue(data) : null;
  }

  async function fetchVenuePrefectures() {
    const values = [];
    for (let from = 0; ; from += venueFetchPageSize) {
      const { data, error } = await client
        .from("venues")
        .select("prefecture")
        .order("prefecture", { ascending: true })
        .range(from, from + venueFetchPageSize - 1);
      if (error) throw error;
      values.push(...(data || []).map((row) => row.prefecture).filter(Boolean));
      if (!data || data.length < venueFetchPageSize) break;
    }
    return [...new Set(values)];
  }

  async function fetchUpcomingVenues(currentUserId, scope = "assigned", limit = 250) {
    let query = client
      .from("venues")
      .select("*")
      .eq("is_hidden", false)
      .order("next_action_date", { ascending: true, nullsFirst: false })
      .limit(limit);
    if (scope !== "all" && currentUserId) query = query.eq("assigned_user_id", currentUserId);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(venueRowToVenue);
  }

  async function updateVenue(venue, currentUserId, expectedLockVersion) {
    if (!client || !venue?.id) throw new Error("更新対象の営業先が見つかりません。");
    const row = venueToRow(venue, currentUserId);
    delete row.id;
    delete row.created_at;
    delete row.created_by;
    row.lock_version = Math.max(1, Number(expectedLockVersion || venue.lockVersion || 1)) + 1;
    row.updated_at = new Date().toISOString();

    const { data, error } = await client
      .from("venues")
      .update(row)
      .eq("id", venue.id)
      .eq("lock_version", Math.max(1, Number(expectedLockVersion || venue.lockVersion || 1)))
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) return { conflict: true, venue: null };
    return { conflict: false, venue: venueRowToVenue(data) };
  }

  async function fetchCallHistories() {
    const { data, error } = await client.from("call_histories").select("*").order("changed_at", { ascending: false }).limit(1000);
    if (error) throw error;
    return (data || []).map(historyRowToEntry);
  }

  async function fetchAuditEvents() {
    const { data, error } = await client
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return (data || []).map(auditRowToEntry);
  }

  async function fetchUserPreferences(userId) {
    if (!userId) return {};
    const { data, error } = await client.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    return preferenceRowToSettings(data || {});
  }

  async function saveUserPreferences(userId, preferences) {
    if (!client || !userId) return;
    const { error } = await client.from("user_preferences").upsert(preferencesToRow(userId, preferences), { onConflict: "user_id" });
    if (error) throw error;
  }

  async function createUser(payload) {
    const session = await getSession();
    if (!session?.access_token) throw new Error("ログイン情報を確認できません。");
    if (window.location.protocol === "file:") {
      throw new Error("Supabaseでのユーザー作成は、Vercelまたはローカルサーバー経由で実行してください。");
    }

    const response = await fetch("/api/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        name: payload.name,
        loginId: normalizeLoginId(payload.loginId),
        password: payload.password,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "ユーザー作成に失敗しました。");
    return profileToUser(result.profile);
  }

  async function updateProfile(id, updates) {
    if (!client || !id) return;
    const row = {};
    if (updates.name !== undefined) row.name = String(updates.name || "").trim();
    if (updates.loginId !== undefined) row.login_id = normalizeLoginId(updates.loginId);
    if (updates.role !== undefined) row.role = updates.role === "admin" ? "admin" : "staff";
    if (updates.active !== undefined) row.active = Boolean(updates.active);
    row.updated_at = new Date().toISOString();
    const { error } = await client.from("profiles").update(row).eq("id", id);
    if (error) throw error;
  }

  async function deleteProfile(id) {
    if (!client || !id) return;
    const deletedByApi = await deleteProfileViaApi(id);
    if (deletedByApi) return;

    await clearProfileReference("venues", "assigned_user_id", id);
    await clearProfileReference("venues", "call_updated_by_user_id", id);
    await clearProfileReference("venues", "created_by", id, true);
    await clearProfileReference("venues", "updated_by", id, true);
    await clearProfileReference("call_histories", "changed_by_user_id", id, true);
    await deleteProfileRelatedRows("user_preferences", "user_id", id, true);

    const { error } = await client.from("profiles").delete().eq("id", id);
    if (error) throw error;
  }

  async function deleteProfileViaApi(id) {
    if (window.location.protocol === "file:") return false;
    const session = await getSession().catch(() => null);
    if (!session?.access_token) return false;

    const response = await fetch("/api/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ id }),
    }).catch(() => null);
    if (!response || response.status === 404) return false;
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "ユーザー削除に失敗しました。");
    return true;
  }

  async function clearProfileReference(table, column, id, optional = false) {
    const { error } = await client.from(table).update({ [column]: null }).eq(column, id);
    if (error && !(optional && isMissingSchemaError(error))) throw error;
  }

  async function deleteProfileRelatedRows(table, column, id, optional = false) {
    const { error } = await client.from(table).delete().eq(column, id);
    if (error && !(optional && isMissingSchemaError(error))) throw error;
  }

  async function upsertVenues(venues, currentUserId) {
    const rows = (Array.isArray(venues) ? venues : [venues]).filter(Boolean).map((venue) => venueToRow(venue, currentUserId));
    if (!client || !rows.length) return;
    for (let index = 0; index < rows.length; index += venueUpsertBatchSize) {
      const batch = rows.slice(index, index + venueUpsertBatchSize);
      const { error } = await client.from("venues").upsert(batch, { onConflict: "id" });
      if (error) throw error;
    }
  }

  async function deleteVenue(id) {
    if (!client || !id) return;
    const { error } = await client.from("venues").delete().eq("id", id);
    if (error) throw error;
  }

  async function insertCallHistories(entries) {
    const rows = (Array.isArray(entries) ? entries : [entries]).filter(Boolean).map(historyEntryToRow);
    if (!client || !rows.length) return;
    const { error } = await client.from("call_histories").insert(rows);
    if (error) throw error;
  }

  async function upsertStatusOptions(statusOptions, statusMeta) {
    const rows = statusOptions.map((name, index) => ({
      name,
      sort_order: index + 1,
      color: normalizeHexColor(statusMeta?.[name]?.color || "#3d7a52"),
      is_closed: Boolean(statusMeta?.[name]?.isClosed),
      updated_at: new Date().toISOString(),
    }));
    if (!client || !rows.length) return;
    const { error } = await client.from("venue_status_options").upsert(rows, { onConflict: "name" });
    if (error) throw error;
  }

  async function deleteStatusOption(name) {
    if (!client || !name) return;
    const { error } = await client.from("venue_status_options").delete().eq("name", name);
    if (error) throw error;
  }

  async function upsertTemperatureOptions(temperatureMeta) {
    const levels = ["A", "B", "C", "D", "E"];
    const rows = levels.map((level, index) => ({
      level,
      label: String(temperatureMeta?.[level]?.label || level).trim() || level,
      color: normalizeHexColor(temperatureMeta?.[level]?.color || "#5b6f82"),
      sort_order: index + 1,
      updated_at: new Date().toISOString(),
    }));
    if (!client) return;
    const { error } = await client.from("venue_temperature_options").upsert(rows, { onConflict: "level" });
    if (error) throw error;
  }

  function profileToUser(row) {
    return {
      id: row.id,
      name: row.name || "未設定ユーザー",
      loginId: row.login_id || "",
      email: row.email || "",
      role: row.role === "admin" ? "admin" : "staff",
      active: row.active !== false,
      authPassword: "",
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || "",
    };
  }

  function statusRowToOption(row) {
    return {
      name: row.name,
      color: normalizeHexColor(row.color || "#3d7a52"),
      isClosed: Boolean(row.is_closed),
    };
  }

  function temperatureRowToOption(row) {
    return {
      level: row.level,
      label: row.label || row.level,
      color: normalizeHexColor(row.color || "#5b6f82"),
    };
  }

  function venueRowToVenue(row) {
    return {
      id: row.id,
      facilityName: row.facility_name || "",
      category: row.category || "",
      recordType: row.record_type === "school" ? "school" : "facility",
      operator: row.operator || "",
      prefecture: row.prefecture || "",
      municipality: row.municipality || "",
      address: row.address || "",
      phone: row.phone || "",
      fax: row.fax || "",
      email: row.email || "",
      website: row.website || "",
      department: row.department || "",
      contactName: row.contact_name || "",
      mainHallName: row.main_hall_name || "",
      seatCount: stringifyNumber(row.seat_count),
      largeHallSeats: stringifyNumber(row.large_hall_seats),
      mediumHallSeats: stringifyNumber(row.medium_hall_seats),
      smallHallSeats: stringifyNumber(row.small_hall_seats),
      genres: row.genres || "",
      programPolicy: row.program_policy || "△",
      status: row.status || "未着手",
      priority: row.temperature || "B",
      rating: row.temperature || "B",
      isHidden: Boolean(row.is_hidden),
      assignedUserId: row.assigned_user_id || "",
      lastContactDate: row.last_contact_date || "",
      callUpdatedAt: row.call_updated_at || "",
      callUpdatedByUserId: row.call_updated_by_user_id || "",
      considerationDate: row.consideration_date || "",
      nextActionDate: row.next_action_date || "",
      notificationLeadDays: stringifyNumber(row.notification_lead_days),
      nextAction: row.next_action || "",
      notes: row.notes || "",
      notesImportant: Boolean(row.notes_important),
      lockVersion: row.lock_version || 1,
      createdAt: row.created_at || "",
      updatedAt: row.updated_at || "",
    };
  }

  function venueToRow(venue, currentUserId) {
    const now = new Date().toISOString();
    return {
      id: ensureUuid(venue.id),
      facility_name: String(venue.facilityName || "").trim() || "名称未設定",
      category: textOrNull(venue.category),
      record_type: venue.recordType === "school" ? "school" : "facility",
      operator: textOrNull(venue.operator),
      prefecture: textOrNull(venue.prefecture),
      municipality: textOrNull(venue.municipality),
      address: textOrNull(venue.address),
      phone: textOrNull(venue.phone),
      fax: textOrNull(venue.fax),
      email: textOrNull(venue.email),
      website: textOrNull(venue.website),
      department: textOrNull(venue.department),
      contact_name: textOrNull(venue.contactName),
      main_hall_name: textOrNull(venue.mainHallName),
      seat_count: integerOrNull(venue.seatCount),
      large_hall_seats: integerOrNull(venue.largeHallSeats),
      medium_hall_seats: integerOrNull(venue.mediumHallSeats),
      small_hall_seats: integerOrNull(venue.smallHallSeats),
      genres: textOrNull(venue.genres),
      program_policy: ["○", "△", "×"].includes(venue.programPolicy) ? venue.programPolicy : "△",
      status: textOrNull(venue.status) || "未着手",
      temperature: normalizeTemperature(venue.priority || venue.rating),
      is_hidden: Boolean(venue.isHidden),
      assigned_user_id: uuidOrNull(venue.assignedUserId),
      last_contact_date: dateOrNull(venue.lastContactDate),
      call_updated_at: dateTimeOrNull(venue.callUpdatedAt),
      call_updated_by_user_id: uuidOrNull(venue.callUpdatedByUserId),
      consideration_date: dateOrNull(venue.considerationDate),
      next_action_date: dateOrNull(venue.nextActionDate),
      notification_lead_days: integerOrNull(venue.notificationLeadDays),
      next_action: textOrNull(venue.nextAction),
      notes: textOrNull(venue.notes),
      notes_important: Boolean(venue.notesImportant),
      created_by: uuidOrNull(venue.createdBy) || uuidOrNull(currentUserId),
      updated_by: uuidOrNull(currentUserId),
      lock_version: Number(venue.lockVersion || 1),
      created_at: venue.createdAt || now,
      updated_at: venue.updatedAt || now,
    };
  }

  function historyRowToEntry(row) {
    return {
      id: row.id,
      venueId: row.venue_id,
      field: row.field,
      fieldLabel: row.field_label,
      previousValue: row.previous_value || "",
      nextValue: row.next_value || "",
      changedByUserId: row.changed_by_user_id || "",
      changedAt: row.changed_at || "",
    };
  }

  function auditRowToEntry(row) {
    const before = row.before_data && typeof row.before_data === "object" ? row.before_data : {};
    const after = row.after_data && typeof row.after_data === "object" ? row.after_data : {};
    const fields = Array.isArray(row.changed_fields) ? row.changed_fields : [];
    const label = row.action === "insert" ? "新規登録" : row.action === "delete" ? "削除" : `更新: ${fields.join(", ") || "項目"}`;
    return {
      id: row.id,
      venueId: row.entity_type === "venues" ? row.entity_id : "",
      facilityName: after.facility_name || before.facility_name || after.name || before.name || (row.entity_type === "profiles" ? "ユーザー設定" : "名称未設定"),
      field: row.action === "update" ? fields[0] || "audit" : row.action,
      fieldLabel: label,
      previousValue: auditValueSummary(before, fields),
      nextValue: auditValueSummary(after, fields),
      changedByUserId: row.actor_id || "",
      changedAt: row.created_at || "",
      isAudit: true,
    };
  }

  function auditValueSummary(values, fields) {
    if (!values || !fields?.length) return "";
    return fields
      .slice(0, 4)
      .map((field) => `${field}: ${values[field] ?? "-"}`)
      .join(" / ");
  }

  function getVenueSort(value) {
    const sort = {
      notification: { column: "next_action_date", ascending: true },
      temperature: { column: "temperature", ascending: true },
      hidden: { column: "is_hidden", ascending: false },
      updated: { column: "updated_at", ascending: false },
      prefecture: { column: "prefecture", ascending: true },
      name: { column: "facility_name", ascending: true },
      nextActionDate: { column: "next_action_date", ascending: true },
    };
    return sort[value] || sort.nextActionDate;
  }

  function normalizeVenueSearch(value) {
    return String(value || "")
      .trim()
      .replace(/[(),]/g, " ")
      .replace(/[%*]/g, "")
      .replace(/\s+/g, " ")
      .slice(0, 100);
  }

  function historyEntryToRow(entry) {
    return {
      id: ensureUuid(entry.id),
      venue_id: uuidOrNull(entry.venueId),
      field: entry.field,
      field_label: entry.fieldLabel || entry.field,
      previous_value: String(entry.previousValue ?? ""),
      next_value: String(entry.nextValue ?? ""),
      changed_by_user_id: uuidOrNull(entry.changedByUserId),
      changed_at: entry.changedAt || new Date().toISOString(),
    };
  }

  function preferenceRowToSettings(row) {
    return {
      columnOrder: Array.isArray(row.column_order) ? row.column_order : [],
      pinnedColumns: Array.isArray(row.pinned_columns) ? row.pinned_columns : [],
      visibleColumns: Array.isArray(row.visible_columns) ? row.visible_columns : [],
      notificationSettings: {
        enabled: Boolean(row.notification_enabled),
        leadDays: numberWithDefault(row.notification_lead_days, 3),
        popupLeadDays: numberWithDefault(row.notification_popup_lead_days, 3),
        displayMode: row.notification_display_mode || "badge",
        scope: row.notification_scope || "assigned",
        dismissCondition: row.notification_dismiss_condition || "nextActionDate",
        notified: objectOrEmpty(row.notification_notified),
        dismissed: objectOrEmpty(row.notification_dismissed),
      },
    };
  }

  function preferencesToRow(userId, preferences) {
    const notificationSettings = preferences.notificationSettings || {};
    return {
      user_id: userId,
      column_order: preferences.columnOrder || [],
      pinned_columns: preferences.pinnedColumns || [],
      visible_columns: preferences.visibleColumns || [],
      notification_enabled: Boolean(notificationSettings.enabled),
      notification_lead_days: numberWithDefault(notificationSettings.leadDays, 3),
      notification_popup_lead_days: numberWithDefault(notificationSettings.popupLeadDays, 3),
      notification_display_mode: notificationSettings.displayMode || "badge",
      notification_scope: notificationSettings.scope || "assigned",
      notification_dismiss_condition: notificationSettings.dismissCondition || "nextActionDate",
      notification_notified: objectOrEmpty(notificationSettings.notified),
      notification_dismissed: objectOrEmpty(notificationSettings.dismissed),
      updated_at: new Date().toISOString(),
    };
  }

  function loginIdToEmail(value = "") {
    const loginId = normalizeLoginId(value);
    if (!loginId) return "";
    return loginId.includes("@") ? loginId : `${loginId}@${authEmailDomain}`;
  }

  function normalizeLoginId(value = "") {
    return String(value ?? "").trim().toLowerCase();
  }

  function normalizeTemperature(value = "B") {
    const level = String(value || "").trim().toUpperCase();
    return ["A", "B", "C", "D", "E"].includes(level) ? level : "B";
  }

  function normalizeHexColor(value = "") {
    const color = String(value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(color) ? color : "#3d7a52";
  }

  function stringifyNumber(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function textOrNull(value) {
    const text = String(value ?? "").trim();
    return text || null;
  }

  function integerOrNull(value) {
    const text = String(value ?? "").replace(/[^\d]/g, "");
    if (!text) return null;
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function dateOrNull(value) {
    const text = String(value ?? "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
  }

  function dateTimeOrNull(value) {
    const text = String(value ?? "").trim();
    return text ? text : null;
  }

  function uuidOrNull(value) {
    const text = String(value ?? "").trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(text) ? text : null;
  }

  function ensureUuid(value) {
    return uuidOrNull(value) || crypto.randomUUID();
  }

  function numberWithDefault(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function objectOrEmpty(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function createFetchClient(baseUrl, anonKey) {
    return {
      auth: {
        async getSession() {
          try {
            const session = await getStoredFetchSession(baseUrl, anonKey);
            return { data: { session }, error: null };
          } catch (error) {
            return { data: { session: null }, error };
          }
        },
        async signInWithPassword({ email, password }) {
          try {
            const session = await authFetch(baseUrl, anonKey, "/auth/v1/token?grant_type=password", {
              method: "POST",
              body: JSON.stringify({ email, password }),
            });
            const normalizedSession = normalizeFetchSession(session);
            writeStoredFetchSession(normalizedSession);
            return { data: { session: normalizedSession, user: normalizedSession.user }, error: null };
          } catch (error) {
            return { data: { session: null, user: null }, error };
          }
        },
        async signOut() {
          window.localStorage.removeItem(fetchSessionKey);
          return { error: null };
        },
      },
      from(table) {
        return new RestQueryBuilder(baseUrl, anonKey, table);
      },
    };
  }

  class RestQueryBuilder {
    constructor(baseUrl, anonKey, table) {
      this.baseUrl = baseUrl;
      this.anonKey = anonKey;
      this.table = table;
      this.method = "GET";
      this.params = new URLSearchParams();
      this.headers = {};
      this.body = null;
      this.single = false;
    }

    select(columns = "*", options = {}) {
      if (this.method === "GET") this.method = "GET";
      this.params.set("select", columns);
      if (options.count === "exact") this.headers.Prefer = appendPrefer(this.headers.Prefer, "count=exact");
      return this;
    }

    order(column, options = {}) {
      const direction = options.ascending === false ? "desc" : "asc";
      const nulls = options.nullsFirst === false ? ".nullslast" : options.nullsFirst === true ? ".nullsfirst" : "";
      const nextOrder = `${column}.${direction}${nulls}`;
      const currentOrder = this.params.get("order");
      this.params.set("order", currentOrder ? `${currentOrder},${nextOrder}` : nextOrder);
      return this;
    }

    eq(column, value) {
      this.params.set(column, `eq.${encodeRestFilterValue(value)}`);
      return this;
    }

    is(column, value) {
      this.params.set(column, `is.${value === null ? "null" : encodeRestFilterValue(value)}`);
      return this;
    }

    or(filters) {
      this.params.set("or", `(${filters})`);
      return this;
    }

    limit(value) {
      this.params.set("limit", String(value));
      return this;
    }

    range(from, to) {
      this.params.set("offset", String(from));
      this.params.set("limit", String(to - from + 1));
      return this;
    }

    maybeSingle() {
      this.single = true;
      return this;
    }

    insert(rows) {
      this.method = "POST";
      this.body = rows;
      this.headers.Prefer = "return=representation";
      return this;
    }

    upsert(rows, options = {}) {
      this.method = "POST";
      this.body = rows;
      if (options.onConflict) this.params.set("on_conflict", options.onConflict);
      this.headers.Prefer = "resolution=merge-duplicates,return=representation";
      return this;
    }

    update(row) {
      this.method = "PATCH";
      this.body = row;
      this.headers.Prefer = "return=representation";
      return this;
    }

    delete() {
      this.method = "DELETE";
      this.headers.Prefer = "return=representation";
      return this;
    }

    then(resolve, reject) {
      return this.execute().then(resolve, reject);
    }

    async execute() {
      try {
        const session = await getStoredFetchSession(this.baseUrl, this.anonKey);
        const query = this.params.toString();
        const response = await fetch(`${this.baseUrl}/rest/v1/${this.table}${query ? `?${query}` : ""}`, {
          method: this.method,
          headers: {
            apikey: this.anonKey,
            Authorization: `Bearer ${session?.access_token || this.anonKey}`,
            "Content-Type": "application/json",
            ...this.headers,
          },
          body: this.body === null ? undefined : JSON.stringify(this.body),
        });
        const text = await response.text();
        const payload = text ? JSON.parse(text) : null;
        if (!response.ok) throw restError(payload, response.status);
        const data = this.single ? (Array.isArray(payload) ? payload[0] || null : payload) : payload;
        return { data, error: null, count: getContentRangeCount(response.headers.get("content-range")) };
      } catch (error) {
        return { data: null, error, count: null };
      }
    }
  }

  async function getStoredFetchSession(baseUrl, anonKey) {
    const session = readStoredFetchSession();
    if (!session?.access_token) return null;
    const expiresAt = Number(session.expires_at || 0);
    const isFresh = expiresAt && expiresAt - 30 > Math.floor(Date.now() / 1000);
    if (isFresh || !session.refresh_token) return session;

    const refreshed = await authFetch(baseUrl, anonKey, "/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: session.refresh_token }),
    });
    const normalizedSession = normalizeFetchSession(refreshed);
    writeStoredFetchSession(normalizedSession);
    return normalizedSession;
  }

  async function authFetch(baseUrl, anonKey, path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (!response.ok) throw restError(payload, response.status);
    return payload;
  }

  function normalizeFetchSession(payload = {}) {
    const now = Math.floor(Date.now() / 1000);
    return {
      ...payload,
      expires_at: payload.expires_at || now + Number(payload.expires_in || 3600),
    };
  }

  function readStoredFetchSession() {
    try {
      const stored = window.localStorage.getItem(fetchSessionKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  function writeStoredFetchSession(session) {
    window.localStorage.setItem(fetchSessionKey, JSON.stringify(session));
  }

  function restError(payload, status) {
    const error = new Error(payload?.msg || payload?.message || payload?.error_description || payload?.error || "Supabase API error");
    error.status = status;
    error.code = payload?.code || payload?.error || "";
    return error;
  }

  function appendPrefer(current, value) {
    return [current, value].filter(Boolean).join(",");
  }

  function encodeRestFilterValue(value) {
    return String(value ?? "").replace(/,/g, "\\,");
  }

  function getContentRangeCount(value) {
    const count = String(value || "").split("/")[1];
    return /^\d+$/.test(count) ? Number(count) : null;
  }

  function isMissingSchemaError(error) {
    const message = String(error?.message || error?.details || "").toLowerCase();
    const code = String(error?.code || "").toUpperCase();
    return ["PGRST204", "42P01", "42703"].includes(code) || message.includes("could not find") || message.includes("does not exist");
  }

  window.crmSupabase = {
    isEnabled,
    getClient,
    getSession,
    signIn,
    signOut,
    getCurrentProfile,
    loadWorkspace,
    fetchVenuePage,
    fetchVenueById,
    fetchAuditEvents,
    fetchVenuePrefectures,
    fetchUpcomingVenues,
    saveUserPreferences,
    createUser,
    updateProfile,
    deleteProfile,
    upsertVenues,
    updateVenue,
    deleteVenue,
    insertCallHistories,
    upsertStatusOptions,
    deleteStatusOption,
    upsertTemperatureOptions,
  };
})();
