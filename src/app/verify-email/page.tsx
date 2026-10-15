"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resendEmailOtp, verifyEmailOtp } from "@frontend/features/auth";
import { useUser } from "@/lib/hooks/use-user";
import PageLoader from "@/components/ui/PageLoader";
import { AuthAlert, AuthShell } from "@/components/auth/AuthShell";
import OtpCodeInput from "@/components/auth/OtpCodeInput";
import { maskEmail, normalizeEmail } from "@/shared/lib/disposable-emails";
import { ApiRequestError } from "@frontend/shared/api/http";

function VerifyEmailForm() {
  const router = useRouter();
  const search = useSearchParams();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const email = normalizeEmail(search.get("email") || "");
  const purpose = search.get("purpose") === "recovery" ? "recovery" : "signup";
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(45);
  const submitting = useRef(false);

  useEffect(() => {
    if (!authLoading && isSignedIn && purpose === "signup") {
      router.replace("/progress");
    }
  }, [authLoading, isSignedIn, purpose, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  useEffect(() => {
    if (code.length !== 6 || loading) return;
    void submit(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const submit = async (token: string) => {
    if (!email) {
      setMessage("Start from sign-up so we know which email to verify.");
      return;
    }
    if (submitting.current) return;
    submitting.current = true;
    setLoading(true);
    setMessage(null);
    try {
      const result = await verifyEmailOtp({ email, token, purpose });
      window.location.assign(result.purpose === "recovery" ? "/reset-password" : "/progress");
    } catch (error) {
      submitting.current = false;
      setCode("");
      setMessage(error instanceof Error ? error.message : "That code did not work.");
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email || resendIn > 0) return;
    setMessage(null);
    try {
      await resendEmailOtp({ email, purpose });
      setResendIn(45);
      setMessage("A new code is on the way.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send a new code.");
      if (error instanceof ApiRequestError && error.status === 429) setResendIn(45);
    }
  };

  if (authLoading) return <PageLoader />;

  if (!email) {
    return (
      <AuthShell title="Check your email" subtitle="We need the address you signed up with.">
        <button
          type="button"
          onClick={() => router.push(purpose === "recovery" ? "/forgot-password" : "/sign-up")}
          className="mt-6 h-12 w-full rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a]"
        >
          {purpose === "recovery" ? "Request a code" : "Back to sign-up"}
        </button>
      </AuthShell>
    );
  }

  const success = message?.toLowerCase().includes("on the way");

  return (
    <AuthShell
      title={purpose === "recovery" ? "Enter your reset code" : "Enter your code"}
      subtitle={`We sent a 6-digit code to ${maskEmail(email)}. It expires in one hour.`}
    >
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (code.length === 6) void submit(code);
        }}
      >
        <OtpCodeInput value={code} onChange={setCode} disabled={loading} />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="h-12 rounded-xl bg-fyte-ink px-5 text-sm font-semibold text-white transition hover:bg-[#3a3a3a] disabled:opacity-60"
        >
          {loading ? "Checking..." : "Verify"}
        </button>
      </form>

      <AuthAlert message={message} tone={success ? "success" : "error"} />

      <p className="mt-6 text-center text-sm text-fyte-muted">
        Didn&apos;t get it?{" "}
        <button
          type="button"
          onClick={() => void resend()}
          disabled={resendIn > 0}
          className="font-semibold text-fyte-ink disabled:text-fyte-muted"
        >
          {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
        </button>
      </p>
      <p className="mt-4 text-center text-sm text-fyte-muted">
        Wrong email?{" "}
        <button
          type="button"
          onClick={() => router.push(purpose === "recovery" ? "/forgot-password" : "/sign-up")}
          className="font-semibold text-fyte-ink"
        >
          {purpose === "recovery" ? "Try another address" : "Go back"}
        </button>
      </p>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VerifyEmailForm />
    </Suspense>
  );
}
