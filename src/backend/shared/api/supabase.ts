import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "../config/env";
import { ApiError } from "../lib/errors";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new ApiError("Unauthorized", 401);
  }

  return { supabase, user };
}

export async function getOptionalUser() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}
