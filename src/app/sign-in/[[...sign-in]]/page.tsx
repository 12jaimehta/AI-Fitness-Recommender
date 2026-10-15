"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@frontend/features/auth";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import FormInput from "@/components/shared/FormInput";
import { signInSchema, type SignInForm } from "@/lib/validation/signINSchema";
import { AuthAlert, AuthDivider, AuthShell } from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { ApiRequestError } from "@frontend/shared/api/http";
import { authReachabilityMessage } from "@/shared/lib/timed-fetch";

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
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
    try {
      await signInWithEmail(vals);
      window.location.assign("/progress");
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "email_not_confirmed") {
        router.push(`/verify-email?email=${encodeURIComponent(vals.email)}`);
        return;
      }
      setMessage(error instanceof Error ? authReachabilityMessage(error) : authReachabilityMessage());
      setLoading(false);
    }
  };

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <AuthShell title="Sign in" subtitle="Use Google, or your email and password.">
      <GoogleAuthButton onError={setMessage} />
      <AuthDivider />

      <form noValidate onSubmit={handleSubmit(doSignIn)} className="flex flex-col gap-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.email?.message}
              required
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.password?.message}
              required
              labelExtra={
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs font-semibold text-fyte-ink"
                >
                  Forgot password?
                </button>
              }
            />
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <AuthAlert message={message} />

      <p className="mt-6 border-t border-fyte-line pt-6 text-center text-sm text-fyte-muted">
        New here?{" "}
        <button
          type="button"
          onClick={() => router.push("/sign-up")}
          className="font-semibold text-fyte-ink"
        >
          Create an account
        </button>
      </p>
    </AuthShell>
  );
}
