"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@frontend/features/auth";
import FormInput from "@/components/shared/FormInput";
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/lib/validation/signINSchema";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordForm) => {
    setLoading(true);
    setMessage(null);
    setSuccess(false);
    try {
      const result = await requestPasswordReset(values.email);
      setSuccess(true);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send a link to set a new password."
    >
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
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
        <button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <AuthAlert message={message} tone={success ? "success" : "error"} />

      <p className="mt-6 border-t border-fyte-line pt-6 text-center text-sm text-fyte-muted">
        Remember it?{" "}
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
