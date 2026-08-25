import "server-only";

import { todayInJapan } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { SalesTarget } from "@/lib/types";

export async function getDashboardData(userId: string) {
  const supabase = await createClient();
  const today = todayInJapan();
  const baseColumns = "id,facility_name,record_type,prefecture,municipality,phone,status,temperature,assigned_user_id,next_action_date,next_action,notes_important,lock_version,updated_at";

  const [dueResult, assignedCount, overdueCount, importantCount] = await Promise.all([
    supabase
      .from("venues")
      .select(baseColumns)
      .eq("is_hidden", false)
      .eq("assigned_user_id", userId)
      .not("next_action_date", "is", null)
      .lte("next_action_date", today)
      .order("next_action_date", { ascending: true })
      .limit(20),
    supabase.from("venues").select("id", { count: "exact", head: true }).eq("is_hidden", false).eq("assigned_user_id", userId),
    supabase.from("venues").select("id", { count: "exact", head: true }).eq("is_hidden", false).eq("assigned_user_id", userId).lt("next_action_date", today),
    supabase.from("venues").select("id", { count: "exact", head: true }).eq("is_hidden", false).eq("assigned_user_id", userId).eq("notes_important", true),
  ]);

  if (dueResult.error) throw new Error("今日の営業予定を取得できませんでした。");

  return {
    today,
    dueTargets: (dueResult.data ?? []) as unknown as SalesTarget[],
    assignedCount: assignedCount.count ?? 0,
    overdueCount: overdueCount.count ?? 0,
    importantCount: importantCount.count ?? 0,
  };
}
