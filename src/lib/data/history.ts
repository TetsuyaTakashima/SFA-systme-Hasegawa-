import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { AuditEvent } from "@/lib/types";

export async function getAuditHistory(page: number, pageSize = 50) {
  const supabase = await createClient();
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const { data, error, count } = await supabase
    .from("audit_events")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw new Error("対応履歴を取得できませんでした。");
  return { events: (data ?? []) as AuditEvent[], total: count ?? 0, page: safePage, pageSize };
}
