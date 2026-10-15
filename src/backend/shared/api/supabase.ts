import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "../config/env";
import { ApiError } from "../lib/errors";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { timedFetch } from "@/shared/lib/timed-fetch";

export type AuthCtx = {
  supabase: SupabaseClient;
  user: User;
};

export async function resolveAuth(auth?: AuthCtx): Promise<AuthCtx> {
  if (auth?.user && auth.supabase) return auth;
  return requireUser();
}

export async function createServerSupabase() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient(url, anonKey, {
    global: { fetch: timedFetch(8_000) },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component; proxy.ts refreshes the session.
        }
      },
    },
  });
}

export async function requireUser(): Promise<AuthCtx> {
  const supabase = await createServerSupabase();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      throw new ApiError("Unauthorized", 401);
    }
    return { supabase, user };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Unauthorized", 401);
  }
}

export async function getOptionalUser() {
  const supabase = await createServerSupabase();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { supabase, user };
  } catch {
    return { supabase, user: null };
  }
}
