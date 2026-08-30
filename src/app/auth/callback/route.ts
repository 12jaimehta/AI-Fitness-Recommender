import { exchangeAuthCode } from "@backend/features/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      await exchangeAuthCode(code);
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_callback_failed`);
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
