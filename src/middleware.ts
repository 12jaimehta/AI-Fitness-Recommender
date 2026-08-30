import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete, profileAllowedPath } from "@/shared/lib/profile";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (user && !profileAllowedPath(pathname)) {
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("full_name, age, gender, height, initial_weight, fitness_level, goals, profile_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!error && !isProfileComplete(profile)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/my-profile";
      redirectUrl.search = "";
      const redirect = NextResponse.redirect(redirectUrl);
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
        redirect.cookies.set(name, value);
      });
      return redirect;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
