import { exchangeAuthCode, safeAuthNext, verifyAuthOtp } from "@backend/features/auth";
import { createServerSupabase } from "@backend/shared/api/supabase";
import { isProfileComplete } from "@/shared/lib/profile";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const oauthError = requestUrl.searchParams.get("error");
  const next = safeAuthNext(requestUrl.searchParams.get("next"), type);

  if (oauthError) {
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_callback_failed`);
  }

  try {
    if (code) {
      await exchangeAuthCode(code);
    } else if (tokenHash && type) {
      await verifyAuthOtp(tokenHash, type);
    }
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_callback_failed`);
  }

  if (next) {
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("full_name, age, gender, height, initial_weight, fitness_level, goals, profile_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!isProfileComplete(profile)) {
      return NextResponse.redirect(`${requestUrl.origin}/my-profile`);
    }

    return NextResponse.redirect(`${requestUrl.origin}/progress`);
  }

  return NextResponse.redirect(`${requestUrl.origin}/sign-in`);
}
