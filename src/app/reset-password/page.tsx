"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { resetPassword } from "@frontend/features/auth";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import PasswordStrength from "@/components/auth/PasswordStrength";
import FormInput from "@/components/shared/FormInput";
import { resetPasswordSchema, type ResetPasswordForm } from "@/lib/validation/signUpSchema";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { password: "", confirmPassword: "" },
  });

  const watchedPassword = watch("password", "");

  useEffect(() => {
    if (authLoading) return;
    if (!isSignedIn) {
      setMessage("This reset code is invalid or has expired.");
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
      <AuthShell title="Reset password" subtitle="Enter the code from your email, then choose a new password.">
        <AuthAlert message={message} />
        <button
          type="button"
          onClick={() => router.push("/forgot-password")}
          className="mt-6 h-12 w-full rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
        >
          Send a new code
        </button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Use a strong password you have not used here before.">
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormInput
                label="New password"
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
          {loading ? "Saving..." : "Update password"}
        </button>
      </form>

      <AuthAlert message={message} />
    </AuthShell>
  );
}
