"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveNotificationPreferences(formData: FormData) {
  const profile = await requireProfile();
  const parsed = z.object({ leadDays: z.coerce.number().int().min(0).max(365), popupLeadDays: z.coerce.number().int().min(0).max(365), displayMode: z.enum(["badge", "badgeDays", "days", "date"]), scope: z.enum(["assigned", "all"]), dismissCondition: z.enum(["nextActionDate", "status", "either"]), enabled: z.string().optional() }).parse(Object.fromEntries(formData));
  const supabase = await createClient();
  const { error } = await supabase.from("user_preferences").upsert({ user_id: profile.id, notification_enabled: parsed.enabled === "true", notification_lead_days: parsed.leadDays, notification_popup_lead_days: parsed.popupLeadDays, notification_display_mode: parsed.displayMode, notification_scope: profile.role === "admin" ? parsed.scope : "assigned", notification_dismiss_condition: parsed.dismissCondition, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/notifications"); revalidatePath("/dashboard");
}
