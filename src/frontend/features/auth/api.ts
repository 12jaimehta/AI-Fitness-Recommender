"use client";

import { api } from "@frontend/shared/api/http";
import { createClient } from "@frontend/shared/api/supabase";

export async function startGoogleOAuth() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  if (error) throw new Error(error.message);
}

export async function requestPasswordReset(email: string) {
  return api<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(password: string, confirmPassword: string) {
  return api<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword }),
  });
}
