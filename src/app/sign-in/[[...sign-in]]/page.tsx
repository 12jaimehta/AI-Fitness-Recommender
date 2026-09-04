"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import { signInSchema, type SignInForm } from "@/lib/validation/signINSchema";
import { AuthAlert, AuthDivider, AuthShell, authInputClass } from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
    if (error === "auth_callback_failed") {
      setMessage("Google sign-in did not complete. Try again.");
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isSignedIn) {
      router.replace("/progress");
    }
  }, [authLoading, isSignedIn, router]);

  const doSignIn = async (vals: SignInForm) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: vals.email,
      password: vals.password,
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else router.push("/progress");
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <AuthShell title="Sign in" subtitle="Use Google, or your email and password.">
      <GoogleAuthButton onError={setMessage} />
      <AuthDivider />

      <form onSubmit={passwordForm.handleSubmit(doSignIn)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-[#282828]">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...passwordForm.register("email")}
            placeholder="you@example.com"
            className={authInputClass}
          />
          {passwordForm.formState.errors.email ? (
            <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-[#282828]">Password</label>
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-xs font-semibold text-[#282828]"
            >
              Forgot password?
            </button>
          </div>
          <input
            type="password"
            autoComplete="current-password"
            {...passwordForm.register("password")}
            placeholder="Your password"
            className={authInputClass}
          />
          {passwordForm.formState.errors.password ? (
            <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.password.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white hover:bg-[#454545] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <AuthAlert message={message} />

      <p className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
        New here?{" "}
        <button
          type="button"
          onClick={() => router.push("/sign-up")}
          className="font-semibold text-[#282828]"
        >
          Create an account
        </button>
      </p>
    </AuthShell>
  );
}
