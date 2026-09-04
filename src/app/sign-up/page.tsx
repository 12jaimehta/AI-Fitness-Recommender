"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import PasswordStrength from "@/components/auth/PasswordStrength";
import FormInput from "@/components/shared/FormInput";
import { signUpSchema, type SignUpForm } from "@/lib/validation/signUpSchema";
import { AuthAlert, AuthDivider, AuthShell } from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password", "");

  useEffect(() => {
    if (!authLoading && isSignedIn) {
      router.replace("/progress");
    }
  }, [authLoading, isSignedIn, router]);

  const doSignUp = async (values: SignUpForm) => {
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: values.fullName },
      },
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else if (data?.user) {
      setMessage("Account created. Check your email to verify.");
      setTimeout(() => router.push("/progress"), 3000);
    }
  };

  const success =
    message?.toLowerCase().includes("check your email") ||
    message?.toLowerCase().includes("account created");

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <AuthShell title="Create an account" subtitle="Use Google, or sign up with email and a password.">
      <GoogleAuthButton label="Continue with Google" onError={setMessage} />
      <AuthDivider />

      <form noValidate onSubmit={handleSubmit(doSignUp)} className="flex flex-col gap-4">
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Full name"
              autoComplete="name"
              placeholder="Your name"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.fullName?.message}
              required
            />
          )}
        />
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
        <div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormInput
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.password?.message}
                required
              />
            )}
          />
          {watchedPassword.length > 0 ? <PasswordStrength value={watchedPassword} /> : null}
        </div>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <FormInput
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={errors.confirmPassword?.message}
              required
            />
          )}
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <AuthAlert message={message} tone={success ? "success" : "error"} />

      <p className="mt-6 border-t border-fyte-line pt-6 text-center text-xs text-fyte-muted">
        By creating an account, you agree to our Terms and Privacy Policy.
      </p>
      <p className="mt-4 text-center text-sm text-fyte-muted">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="font-semibold text-fyte-ink"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}
