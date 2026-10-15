import { createServerSupabase } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { signInSchema } from "@/shared/validation/signINSchema";
import { authReachabilityMessage, isAuthReachabilityError, withTimeout } from "@/shared/lib/timed-fetch";

export async function signInWithEmailPassword(body: unknown) {
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Please enter a valid email and password", 400);
  }

  const supabase = await createServerSupabase();
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      }),
      10_000
    );

    if (error) {
      const text = error.message.toLowerCase();
      if (text.includes("not confirmed") || text.includes("email not confirmed")) {
        throw new ApiError("Enter the 6-digit code we sent when you signed up.", 403, {
          code: "email_not_confirmed",
        });
      }
      if (isAuthReachabilityError(error)) {
        throw new ApiError(authReachabilityMessage(error), 503);
      }
      throw new ApiError(error.message || "Could not sign in. Try again.", 401);
    }

    return { email: parsed.data.email, userId: data.user?.id || null };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(authReachabilityMessage(error), 503);
  }
}
