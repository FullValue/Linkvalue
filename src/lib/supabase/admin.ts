import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "./types";

/**
 * Service-role client. **Bypasses Row Level Security** — use ONLY in trusted
 * server code (e.g. analytics tracking writes). Never import into the browser.
 */
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = clientEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = serverEnv();

  return createSupabaseClient<Database>(
    NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
