import { createServerSupabase } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";

export async function exchangeAuthCode(code: string) {
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) throw new ApiError(error.message, 400);
}
