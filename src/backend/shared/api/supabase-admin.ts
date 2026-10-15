import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseEnv } from "../config/env";
import { timedFetch } from "@/shared/lib/timed-fetch";

let cached: SupabaseClient | null = null;

/** Privileged client for webhook grants. Never import this in a client component. */
export function createServiceSupabase(): SupabaseClient | null {
  const serviceKey = getServiceRoleKey();
  if (!serviceKey) return null;
  if (cached) return cached;
  const { url } = getSupabaseEnv();
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: timedFetch(8_000) },
  });
  return cached;
}
