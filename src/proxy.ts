import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete, profileAllowedPath } from "@/shared/lib/profile";
import { isApiPath, isConnectPath, isDashboardPath, isKnownAppPath, isPublicAuthPath } from "@/shared/lib/routes";
import { SIGNED_IN_HOME } from "@/shared/lib/app-home";
import { timedFetch } from "@/shared/lib/timed-fetch";

function redirectWithCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  const redirect = NextResponse.redirect(redirectUrl);
  from.cookies.getAll().forEach(({ name, value }) => {
    redirect.cookies.set(name, value);
  });
  return redirect;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isApiPath(pathname) || isPublicAuthPath(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    if (!isKnownAppPath(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    global: { fetch: timedFetch(4_000) },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  if (isConnectPath(pathname) || isDashboardPath(pathname)) {
    return redirectWithCookies(request, supabaseResponse, user ? SIGNED_IN_HOME : "/");
  }

  if (!isKnownAppPath(pathname)) {
    return redirectWithCookies(request, supabaseResponse, user ? SIGNED_IN_HOME : "/");
  }

  if (user && !profileAllowedPath(pathname)) {
    try {
      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("full_name, age, gender, height, initial_weight, fitness_level, goals, profile_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (!error && !isProfileComplete(profile)) {
        return redirectWithCookies(request, supabaseResponse, "/my-profile");
      }
    } catch {
      /* auth host unreachable; let the page load */
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
