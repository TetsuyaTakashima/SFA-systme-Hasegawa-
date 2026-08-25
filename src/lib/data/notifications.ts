import "server-only";

import { todayInJapan } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { Profile, SalesTarget } from "@/lib/types";

export interface NotificationPreferences {
  notification_enabled: boolean;
  notification_lead_days: number;
  notification_popup_lead_days: number;
  notification_display_mode: string;
  notification_scope: string;
  notification_dismiss_condition: string;
}

export async function getNotificationData(profile: Profile) {
  const supabase = await createClient();
  const { data: row } = await supabase.from("user_preferences").select("*").eq("user_id", profile.id).maybeSingle();
  const preferences: NotificationPreferences = {
    notification_enabled: Boolean(row?.notification_enabled), notification_lead_days: row?.notification_lead_days ?? 3,
    notification_popup_lead_days: row?.notification_popup_lead_days ?? 3, notification_display_mode: row?.notification_display_mode ?? "badge",
    notification_scope: row?.notification_scope ?? "assigned", notification_dismiss_condition: row?.notification_dismiss_condition ?? "nextActionDate",
  };
  const from = todayInJapan();
  const untilDate = new Date(`${from}T00:00:00+09:00`);
  untilDate.setDate(untilDate.getDate() + preferences.notification_lead_days);
  const until = untilDate.toISOString().slice(0, 10);
  let query = supabase.from("venues").select("id,facility_name,status,temperature,prefecture,municipality,next_action_date,next_action,assigned_user_id,record_type").eq("is_hidden", false).gte("next_action_date", from).lte("next_action_date", until).order("next_action_date").limit(100);
  if (preferences.notification_scope !== "all" || profile.role !== "admin") query = query.eq("assigned_user_id", profile.id);
  const { data, error } = await query;
  if (error) throw new Error("通知予定を取得できませんでした。");
  return { preferences, targets: (data ?? []) as unknown as SalesTarget[] };
}
