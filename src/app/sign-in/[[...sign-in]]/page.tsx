"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useUser } from "@/lib/hooks/use-user";
import Tabs from "@/components/ui/Tabs";
import PageLoader from "@/components/ui/PageLoader";
import { magicLinkSchema, signInSchema, type MagicLinkForm, type SignInForm } from "@/lib/validation/signINSchema";
import { UnifiedFooter } from "@/components";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isSignedIn, isLoading: authLoading } = useUser();
  const [active, setActive] = useState<"password" | "magic">("magic");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const magicForm = useForm<MagicLinkForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });
  const passwordForm = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!authLoading && isSignedIn) {
      router.replace("/progress");
    }
  }, [authLoading, isSignedIn, router]);

  const doMagic = async (vals: MagicLinkForm) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: vals.email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Check your email for a sign-in link.");
  };

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

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]";

  if (authLoading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-2xl font-bold text-[#282828]"
          >
            fyteAI
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-xl border-2 border-[#282828] bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white"
          >
            Back to home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900">Sign in</h1>
          <p className="mt-2 text-sm text-gray-600">
            Use a magic link if you do not have a password yet.
          </p>

          <div className="mt-6">
            <Tabs
              active={active}
              onChange={(key) => setActive(key as "magic" | "password")}
              tabs={[
                { key: "magic", label: "Magic link", icon: <Mail size={16} /> },
                { key: "password", label: "Password", icon: <Lock size={16} /> },
              ]}
            />
          </div>

          {active === "magic" ? (
            <form onSubmit={magicForm.handleSubmit(doMagic)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-[#282828]">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...magicForm.register("email")}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {magicForm.formState.errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{magicForm.formState.errors.email.message}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white hover:bg-[#454545] disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send magic link"}
              </button>
            </form>
          ) : (
            <form onSubmit={passwordForm.handleSubmit(doSignIn)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-[#282828]">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  {...passwordForm.register("email")}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {passwordForm.formState.errors.email ? (
                  <p className="mt-1 text-xs text-red-600">{passwordForm.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div>
                <label className="text-sm font-semibold text-[#282828]">Password</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  {...passwordForm.register("password")}
                  placeholder="Your password"
                  className={inputClass}
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
          )}

          {message ? (
            <p
              className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                message.toLowerCase().includes("check your email")
                  ? "border border-gray-200 bg-gray-50 text-gray-700"
                  : "border border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          ) : null}

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
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}
