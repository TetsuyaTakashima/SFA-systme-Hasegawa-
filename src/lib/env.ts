const fallbackUrl = "https://oyqbdscgihysjwzykdzq.supabase.co";
const fallbackPublishableKey = "sb_publishable_QLhd2ZHJNkDcjIAN8WGG1w_jg7mo0wS";

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? fallbackUrl,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? fallbackPublishableKey,
  authEmailDomain: process.env.NEXT_PUBLIC_AUTH_EMAIL_DOMAIN ?? "crm.local",
};

export function getServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません。");
  return value;
}
