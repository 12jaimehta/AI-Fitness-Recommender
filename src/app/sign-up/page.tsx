"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { signUpSchema, type SignUpForm } from "@/lib/validation/signUpSchema";
import { AuthAlert, AuthDivider, AuthShell, authInputClass } from "@/components/auth/AuthShell";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordForm = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const watchedPassword = passwordForm.watch("password", "");

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

      <form onSubmit={passwordForm.handleSubmit(doSignUp)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-fyte-ink">Full name</label>
          <input
            type="text"
            autoComplete="name"
            {...passwordForm.register("fullName")}
            placeholder="Your name"
            className={authInputClass}
          />
          {passwordForm.formState.errors.fullName ? (
            <p className="mt-1 text-xs text-fyte-danger">{passwordForm.formState.errors.fullName.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-fyte-ink">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...passwordForm.register("email")}
            placeholder="you@example.com"
            className={authInputClass}
          />
          {passwordForm.formState.errors.email ? (
            <p className="mt-1 text-xs text-fyte-danger">{passwordForm.formState.errors.email.message}</p>
          ) : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-fyte-ink">Password</label>
          <input
            type="password"
            autoComplete="new-password"
            {...passwordForm.register("password")}
            placeholder="Create a password"
            className={authInputClass}
          />
          {passwordForm.formState.errors.password ? (
            <p className="mt-1 text-xs text-fyte-danger">{passwordForm.formState.errors.password.message}</p>
          ) : null}
          {watchedPassword.length > 0 ? <PasswordStrength value={watchedPassword} /> : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-fyte-ink">Confirm password</label>
          <input
            type="password"
            autoComplete="new-password"
            {...passwordForm.register("confirmPassword")}
            placeholder="Repeat password"
            className={authInputClass}
          />
          {passwordForm.formState.errors.confirmPassword ? (
            <p className="mt-1 text-xs text-fyte-danger">{passwordForm.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>
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
