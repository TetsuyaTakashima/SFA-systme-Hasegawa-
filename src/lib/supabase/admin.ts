import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey, publicEnv } from "@/lib/env";

export function createAdminClient() {
  return createClient(publicEnv.supabaseUrl, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
