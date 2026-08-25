import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { SalesTargetFilters } from "@/lib/sales-target-filters";
import type { SalesTarget } from "@/lib/types";

export async function getSalesTargetPage(filters: SalesTargetFilters, currentUserId: string) {
  const supabase = await createClient();
  let query = supabase.from("venues").select("*", { count: "exact" });

  if (filters.statuses.length === 1) query = query.eq("status", filters.statuses[0]!);
  if (filters.statuses.length > 1) query = query.in("status", filters.statuses);
  if (filters.prefecture) query = query.eq("prefecture", filters.prefecture);
  if (filters.temperature) query = query.eq("temperature", filters.temperature);
  if (filters.recordType) query = query.eq("record_type", filters.recordType);
  if (filters.assignee === "current") query = query.eq("assigned_user_id", currentUserId);
  else if (filters.assignee === "unassigned") query = query.is("assigned_user_id", null);
  else if (filters.assignee) query = query.eq("assigned_user_id", filters.assignee);
  if (filters.visibility === "visible") query = query.eq("is_hidden", false);
  if (filters.visibility === "hidden") query = query.eq("is_hidden", true);

  if (filters.search) {
    const pattern = `*${filters.search}*`;
    query = query.ilike("search_text", pattern);
  }

  const sorts = {
    nextAction: { column: "next_action_date", ascending: true },
    updated: { column: "updated_at", ascending: false },
    name: { column: "facility_name", ascending: true },
    prefecture: { column: "prefecture", ascending: true },
    temperature: { column: "temperature", ascending: true },
  } as const;
  const sort = sorts[filters.sort];
  const from = (filters.page - 1) * filters.pageSize;
  const { data, error, count } = await query
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .order("id", { ascending: true })
    .range(from, from + filters.pageSize - 1);

  if (error) throw new Error(`営業先一覧を取得できませんでした: ${error.message}`);
  return { targets: (data ?? []) as SalesTarget[], total: count ?? 0 };
}

export async function getSalesTarget(id: string | undefined) {
  if (!id) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("営業先の詳細を取得できませんでした。");
  return data as SalesTarget | null;
}
