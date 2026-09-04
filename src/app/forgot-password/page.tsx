"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { requestPasswordReset } from "@frontend/features/auth";
import { forgotPasswordSchema, type ForgotPasswordForm } from "@/lib/validation/signINSchema";
import { AuthAlert, AuthShell, authInputClass } from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-semibold text-[#282828]">Email</label>
          <input
            type="email"
            autoComplete="email"
            {...form.register("email")}
            placeholder="you@example.com"
            className={authInputClass}
          />
          {form.formState.errors.email ? (
            <p className="mt-1 text-xs text-red-600">{form.formState.errors.email.message}</p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white hover:bg-[#454545] disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <AuthAlert message={message} tone={success ? "success" : "error"} />

      <p className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
        Remember it?{" "}
        <button
          type="button"
          onClick={() => router.push("/sign-in")}
          className="font-semibold text-[#282828]"
        >
          Sign in
        </button>
      </p>
    </AuthShell>
  );
}
