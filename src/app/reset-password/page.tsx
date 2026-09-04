"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { resetPassword } from "@frontend/features/auth";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { resetPasswordSchema, type ResetPasswordForm } from "@/lib/validation/signUpSchema";
import { AuthAlert, AuthShell, authInputClass } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedPassword = form.watch("password", "");

  useEffect(() => {
    if (authLoading) return;
    if (!isSignedIn) {
      setMessage("This reset link is invalid or has expired.");
      setReady(true);
      return;
    }
    setReady(true);
  }, [authLoading, isSignedIn]);

  const onSubmit = async (values: ResetPasswordForm) => {
    setLoading(true);
    setMessage(null);
    try {
      await resetPassword(values.password, values.confirmPassword);
      router.replace("/progress");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update password.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !ready) {
    return <PageLoader />;
  }

  if (!isSignedIn) {
    return (
      <AuthShell title="Reset password" subtitle="Open the link from your email to choose a new password.">
        <AuthAlert message={message} />
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="mt-6 h-12 w-full rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
        >
          Send a new link
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Use a strong password you have not used here before.">
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-fyte-ink">New password</label>
          <input
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
            placeholder="Create a password"
            className={authInputClass}
          />
          {form.formState.errors.password ? (
            <p className="mt-1 text-xs text-fyte-danger">{form.formState.errors.password.message}</p>
          ) : null}
          {watchedPassword.length > 0 ? <PasswordStrength value={watchedPassword} /> : null}
        </div>
        <div>
          <label className="text-sm font-semibold text-fyte-ink">Confirm password</label>
          <input
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
            placeholder="Repeat password"
            className={authInputClass}
          />
          {form.formState.errors.confirmPassword ? (
            <p className="mt-1 text-xs text-fyte-danger">{form.formState.errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
        >
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>

      <AuthAlert message={message} />
    </AuthShell>
  );
}
