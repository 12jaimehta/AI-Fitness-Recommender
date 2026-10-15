"use client";

import { api } from "@frontend/shared/api/http";
import { createClient } from "@frontend/shared/api/supabase";
import { authReachabilityMessage, isAuthReachabilityError, withTimeout } from "@/shared/lib/timed-fetch";

export async function startGoogleOAuth() {
  const supabase = createClient();
  try {
    const { error } = await withTimeout(
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: "select_account" },
        },
      }),
      10_000
    );
    if (error) throw new Error(isAuthReachabilityError(error) ? authReachabilityMessage(error) : error.message);
  } catch (error) {
    throw new Error(authReachabilityMessage(error));
  }
}

export async function requestPasswordReset(email: string) {
  return api<{ message: string; email: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function signInWithEmail(input: { email: string; password: string }) {
  return api<{ message: string; email: string }>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function signUpWithEmail(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  return api<{ message: string; email: string }>("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmailOtp(input: { email: string; token: string; purpose?: "signup" | "recovery" }) {
  return api<{ message: string; purpose: "signup" | "recovery" }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resendEmailOtp(input: { email: string; purpose?: "signup" | "recovery" }) {
  return api<{ message: string; email: string }>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function resetPassword(password: string, confirmPassword: string) {
  return api<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ password, confirmPassword }),
  });
}
