"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { publicEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface SettingsActionState { success?: string; error?: string }

export async function createUserAction(_state: SettingsActionState, formData: FormData): Promise<SettingsActionState> {
  await requireAdmin();
  const parsed = z.object({ name: z.string().trim().min(1), loginId: z.string().trim().min(1).regex(/^[a-zA-Z0-9._-]+$/u), password: z.string().min(8) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "名前・ログインID・8文字以上のパスワードを確認してください。" };
  try {
    const admin = createAdminClient();
    const loginId = parsed.data.loginId.toLowerCase();
    const { error } = await admin.auth.admin.createUser({
      email: `${loginId}@${publicEnv.authEmailDomain}`,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: { name: parsed.data.name, login_id: loginId },
    });
    if (error) return { error: error.message };
    revalidatePath("/settings");
    return { success: "ユーザーを作成しました。" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "ユーザーを作成できませんでした。" };
  }
}

export async function updateUserAction(formData: FormData) {
  const current = await requireAdmin();
  const parsed = z.object({ id: z.uuid(), name: z.string().trim().min(1), role: z.enum(["admin", "staff"]), active: z.enum(["true", "false"]) }).parse(Object.fromEntries(formData));
  if (parsed.id === current.id && parsed.active === "false") throw new Error("自分自身を停止することはできません。");
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ name: parsed.name, role: parsed.role, active: parsed.active === "true", updated_at: new Date().toISOString() }).eq("id", parsed.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function deleteUserAction(formData: FormData) {
  const current = await requireAdmin();
  const id = z.uuid().parse(formData.get("id"));
  if (id === current.id) throw new Error("自分自身を削除することはできません。");
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function saveStatusAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ id: z.string().optional(), name: z.string().trim().min(1).max(100), color: z.string().regex(/^#[0-9a-f]{6}$/iu), sort_order: z.coerce.number().int().min(0), is_closed: z.string().optional() }).parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const row = { name: parsed.name, color: parsed.color, sort_order: parsed.sort_order, is_closed: parsed.is_closed === "true", updated_at: new Date().toISOString() };
  const result = parsed.id ? await supabase.from("venue_status_options").update(row).eq("id", parsed.id) : await supabase.from("venue_status_options").insert(row);
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/settings"); revalidatePath("/sales-targets");
}

export async function saveTemperatureAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ level: z.enum(["A", "B", "C", "D", "E"]), label: z.string().trim().min(1).max(100), color: z.string().regex(/^#[0-9a-f]{6}$/iu), sort_order: z.coerce.number().int().min(0) }).parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("venue_temperature_options").update({ label: parsed.label, color: parsed.color, sort_order: parsed.sort_order, updated_at: new Date().toISOString() }).eq("level", parsed.level);
  if (error) throw new Error(error.message);
  revalidatePath("/settings"); revalidatePath("/sales-targets");
}

export async function saveTargetTypeAction(formData: FormData) {
  await requireAdmin();
  const parsed = z.object({ original_key: z.string().optional(), key: z.string().trim().regex(/^[a-z0-9_-]+$/u).max(50), label: z.string().trim().min(1).max(100), sort_order: z.coerce.number().int().min(0), active: z.string().optional() }).parse(Object.fromEntries(formData));
  if (parsed.original_key && parsed.original_key !== parsed.key) throw new Error("登録後の種別キーは変更できません。");
  const supabase = await createClient();
  const { error } = await supabase.from("sales_target_types").upsert({ key: parsed.key, label: parsed.label, sort_order: parsed.sort_order, active: parsed.active === "true", updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw new Error(error.message);
  revalidatePath("/settings"); revalidatePath("/sales-targets");
}
