import "server-only";

import { cache } from "react";
import { DEFAULT_TARGET_TYPES, PREFECTURES } from "@/lib/constants";
import { getProfileDirectory } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { MasterData, SalesTargetType, StatusOption, TemperatureOption } from "@/lib/types";

export const getMasterData = cache(async (): Promise<MasterData> => {
  const supabase = await createClient();
  const [statusesResult, temperaturesResult, typesResult, profiles] = await Promise.all([
    supabase.from("venue_status_options").select("id,name,sort_order,color,is_closed").order("sort_order"),
    supabase.from("venue_temperature_options").select("level,label,sort_order,color").order("sort_order"),
    supabase.from("sales_target_types").select("key,label,sort_order,active").eq("active", true).order("sort_order"),
    getProfileDirectory(),
  ]);

  if (statusesResult.error) throw new Error("状態の選択肢を取得できませんでした。");
  if (temperaturesResult.error) throw new Error("温度感の選択肢を取得できませんでした。");

  return {
    statuses: (statusesResult.data ?? []) as StatusOption[],
    temperatures: (temperaturesResult.data ?? []) as TemperatureOption[],
    targetTypes: typesResult.error
      ? [...DEFAULT_TARGET_TYPES]
      : (typesResult.data ?? []) as SalesTargetType[],
    profiles,
    prefectures: [...PREFECTURES],
  };
});
