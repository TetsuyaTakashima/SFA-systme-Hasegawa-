"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { canCreateSalesTargets } from "@/lib/permissions";
import { validateChangedContactFields } from "@/lib/sales-target-contact-validation";
import { createClient } from "@/lib/supabase/server";

export interface TargetActionState { success?: string; error?: string; conflict?: boolean }

const nullableText = z.string().trim().transform((value) => value || null);
const nullableInteger = z.string().trim().transform((value, context) => {
  if (!value) return null;
  const parsed = Number.parseInt(value.replace(/[^0-9]/gu, ""), 10);
  if (!Number.isFinite(parsed)) {
    context.addIssue({ code: "custom", message: "数値を入力してください。" });
    return z.NEVER;
  }
  return parsed;
});
const nullableDate = z.string().trim().transform((value) => value || null);

const targetSchema = z.object({
  facility_name: z.string().trim().min(1, "営業先名を入力してください。").max(200),
  record_type: z.string().trim().min(1).max(50),
  category: nullableText,
  operator: nullableText,
  prefecture: nullableText,
  municipality: nullableText,
  address: nullableText,
  phone: nullableText,
  fax: nullableText,
  email: nullableText,
  website: nullableText,
  department: nullableText,
  contact_name: nullableText,
  main_hall_name: nullableText,
  seat_count: nullableInteger,
  large_hall_seats: nullableInteger,
  medium_hall_seats: nullableInteger,
  small_hall_seats: nullableInteger,
  genres: nullableText,
  program_policy: z.enum(["○", "△", "×"]),
  status: z.string().trim().min(1).max(100),
  temperature: z.enum(["A", "B", "C", "D", "E"]),
  assigned_user_id: z.string().trim().transform((value) => value === "__none" || !value ? null : value),
  last_contact_date: nullableDate,
  consideration_date: nullableDate,
  next_action_date: nullableDate,
  notification_lead_days: nullableInteger,
  next_action: nullableText,
  notes: nullableText,
  notes_important: z.coerce.boolean().default(false),
  is_hidden: z.coerce.boolean().default(false),
});

const historyLabels: Record<string, string> = {
  facility_name: "営業先名", status: "状態", temperature: "温度感", assigned_user_id: "営業担当",
  next_action_date: "次回対応日", next_action: "次回対応", notes: "メモ", phone: "電話番号",
};

export async function updateSalesTargetAction(
  id: string,
  expectedLockVersion: number,
  _previous: TargetActionState,
  formData: FormData,
): Promise<TargetActionState> {
  const profile = await requireProfile();
  const input = Object.fromEntries(formData);
  const parsed = targetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  const supabase = await createClient();
  const { data: previous, error: previousError } = await supabase.from("venues").select("*").eq("id", id).maybeSingle();
  if (previousError || !previous) return { error: "更新対象が見つかりません。" };
  const contactError = validateChangedContactFields(parsed.data, previous);
  if (contactError) return { error: contactError };

  const update = { ...parsed.data, updated_by: profile.id } as Record<string, unknown>;
  if (profile.role !== "admin") {
    delete update.record_type;
    delete update.assigned_user_id;
    delete update.is_hidden;
  }
  const changedKeys = Object.keys(update).filter((key) => key !== "updated_by" && previous[key] !== update[key]);
  if (changedKeys.some((key) => ["status", "temperature", "next_action_date", "next_action", "notes"].includes(key))) {
    update.call_updated_at = new Date().toISOString();
    update.call_updated_by_user_id = profile.id;
  }

  const { data, error } = await supabase
    .from("venues")
    .update(update)
    .eq("id", id)
    .eq("lock_version", expectedLockVersion)
    .select("id,lock_version")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "別のユーザーが先に更新しました。最新内容を確認してください。", conflict: true };

  const histories = changedKeys.filter((key) => historyLabels[key]).map((key) => ({
    venue_id: id,
    field: key,
    field_label: historyLabels[key]!,
    previous_value: previous[key] === null ? "" : String(previous[key]),
    next_value: update[key] === null ? "" : String(update[key]),
    changed_by_user_id: profile.id,
  }));
  if (histories.length) await supabase.from("call_histories").insert(histories);

  revalidatePath("/sales-targets");
  revalidatePath("/dashboard");
  return { success: "営業先を更新しました。" };
}

const createSchema = z.object({
  facility_name: z.string().trim().min(1, "営業先名を入力してください。").max(200),
  record_type: z.string().trim().min(1).max(50),
  prefecture: nullableText,
  status: z.string().trim().min(1).max(100),
});

export async function createSalesTargetAction(_previous: TargetActionState, formData: FormData): Promise<TargetActionState & { id?: string }> {
  const profile = await requireProfile();
  if (!canCreateSalesTargets(profile)) return { error: "営業先を追加する権限がありません。" };
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  const supabase = await createClient();
  const { data, error } = await supabase.from("venues").insert({ ...parsed.data, created_by: profile.id, updated_by: profile.id }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/sales-targets");
  return { success: "営業先を追加しました。", id: data.id };
}

export async function deleteSalesTargetAction(id: string): Promise<TargetActionState> {
  const profile = await requireProfile();
  if (profile.role !== "admin") return { error: "営業先を削除できるのは管理者のみです。" };
  const supabase = await createClient();
  const { error } = await supabase.from("venues").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/sales-targets");
  return { success: "営業先を削除しました。" };
}
