"use server";

import { redirect } from "next/navigation";
import type { Route } from "next";
import { z } from "zod";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  error?: string;
}

const loginSchema = z.object({
  loginId: z.string().trim().min(1, "ログインIDを入力してください。"),
  password: z.string().min(1, "パスワードを入力してください。"),
  next: z.string().optional(),
});

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください。" };

  const email = parsed.data.loginId.includes("@")
    ? parsed.data.loginId.toLowerCase()
    : `${parsed.data.loginId.toLowerCase()}@${publicEnv.authEmailDomain}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: parsed.data.password });

  if (error || !data.user) return { error: "ログインIDまたはパスワードが正しくありません。" };

  const { data: profile } = await supabase.from("profiles").select("active").eq("id", data.user.id).maybeSingle();
  if (!profile?.active) {
    await supabase.auth.signOut();
    return { error: "このアカウントは停止中です。管理者に確認してください。" };
  }

  const destination = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//")
    ? parsed.data.next
    : "/dashboard";
  redirect(destination as Route);
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
