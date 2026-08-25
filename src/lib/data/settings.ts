import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Profile, SalesTargetType, StatusOption, TemperatureOption } from "@/lib/types";

export async function getSettingsData() {
  const supabase = await createClient();
  const [profiles, statuses, temperatures, types] = await Promise.all([
    supabase.from("profiles").select("*").order("active", { ascending: false }).order("name"),
    supabase.from("venue_status_options").select("id,name,sort_order,color,is_closed").order("sort_order"),
    supabase.from("venue_temperature_options").select("level,label,sort_order,color").order("sort_order"),
    supabase.from("sales_target_types").select("key,label,sort_order,active").order("sort_order"),
  ]);
  if (profiles.error || statuses.error || temperatures.error) throw new Error("管理設定を取得できませんでした。");
  return {
    profiles: (profiles.data ?? []) as Profile[],
    statuses: (statuses.data ?? []) as StatusOption[],
    temperatures: (temperatures.data ?? []) as TemperatureOption[],
    targetTypes: types.error ? [] : (types.data ?? []) as SalesTargetType[],
  };
}

export async function getImportTargetTypes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales_target_types")
    .select("key,label,sort_order,active")
    .eq("active", true)
    .order("sort_order");
  if (error) return [];
  return (data ?? []) as SalesTargetType[];
}

export async function getImportCoverage() {
  const supabase = await createClient();
  const rpcResult = await supabase.rpc("sales_target_import_coverage");
  if (!rpcResult.error) {
    return (rpcResult.data ?? []).map((item: { prefecture: string; record_type: string; target_count: number }) => ({
      prefecture: item.prefecture,
      recordType: item.record_type,
      count: Number(item.target_count),
    }));
  }
  const pairs: Array<{ prefecture: string | null; record_type: string }> = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from("venues").select("prefecture,record_type").range(from, from + 999);
    if (error) throw new Error("取り込み状況を取得できませんでした。");
    pairs.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const counts = new Map<string, number>();
  for (const pair of pairs) {
    if (!pair.prefecture) continue;
    const key = `${pair.prefecture}\u0000${pair.record_type}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].map(([key, count]) => {
    const [prefecture, recordType] = key.split("\u0000");
    return { prefecture: prefecture!, recordType: recordType!, count };
  });
}
