"use client";

import { createBrowserClient } from "@supabase/ssr";
import { timedFetch } from "@/shared/lib/timed-fetch";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, anonKey, {
    global: { fetch: timedFetch(8_000) },
  });
}
