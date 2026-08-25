import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, ProfileDirectoryEntry } from "@/lib/types";

export const getOptionalProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) return null;

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data || data.active === false) return null;
  return data as Profile;
});

export const requireProfile = cache(async () => {
  const profile = await getOptionalProfile();
  if (!profile) redirect("/login");
  return profile;
});

export const requireAdmin = cache(async () => {
  const profile = await requireProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
});

export const getProfileDirectory = cache(async (): Promise<ProfileDirectoryEntry[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_profile_directory");
  if (error) throw new Error("担当者一覧を取得できませんでした。");
  return (data ?? []) as ProfileDirectoryEntry[];
});
