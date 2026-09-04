import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase, requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { forgotPasswordSchema } from "@/shared/validation/signINSchema";
import { resetPasswordSchema } from "@/shared/validation/signUpSchema";

const RESET_NEXT = "/reset-password";

export async function exchangeAuthCode(code: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new ApiError(error.message, 400);
}

export async function verifyAuthOtp(tokenHash: string, type: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });
  if (error) throw new ApiError(error.message, 400);
}

export function safeAuthNext(next: string | null, type: string | null) {
  if (type === "recovery" || next === RESET_NEXT) return RESET_NEXT;
  return null;
}

export async function requestPasswordReset(email: string, origin: string) {
  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Please enter a valid email", 400);
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=${RESET_NEXT}`,
  });
  if (error) throw new ApiError(error.message, 400);
}

export async function updateAccountPassword(body: unknown) {
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Invalid password", 400);
  }

  const { supabase } = await requireUser();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) throw new ApiError(error.message, 400);
}
