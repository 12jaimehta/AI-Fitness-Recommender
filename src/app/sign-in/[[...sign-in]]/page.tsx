"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import Tabs from "@/components/ui/tabs";
import Input from "@/components/ui/input";
import MotionButton from "@/components/ui/motionButton";
import AuthLeftSection from "@/components/auth/AuthLeftSection";
import UnifiedFooter from "@/components/shared/UnifiedFooter";
import { MagicLinkForm, magicLinkSchema ,signInSchema,SignInForm} from "@/lib/validation/signINSchema";

export default function SignInPage() {
  const router = useRouter();
  const supabase = createClient();
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
    else setMessage("🎉 Magic link sent! Check your email.");
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
    else {
      setMessage("Welcome back! Redirecting...");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#162a41_0%,#1e3a5f_100%)] relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="py-8">
          <div className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
            <div
              className="flex items-center gap-3 text-white font-semibold text-[28px] cursor-pointer"
              onClick={() => router.push("/")}
            >
              fyteAI
            </div>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-all hover:scale-105 cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-[1200px] w-full items-center">
            <AuthLeftSection />
            <div className="bg-white rounded-[24px] p-12 shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white/30">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-extrabold text-[#162a41] mb-1">Welcome Back</h2>
                <p className="text-base text-gray-500 m-0">
                  Choose your preferred sign in method
                </p>
              </div>
              <Tabs
                active={active}
                onChange={(k) => setActive(k as "magic" | "password")}
                tabs={[
                  { key: "magic", label: "Magic Link", icon: <Mail size={16} /> },
                  { key: "password", label: "Password", icon: <Lock size={16} /> },
                ]}
              />
              {active === "magic" && (
                <form
                  onSubmit={magicForm.handleSubmit(doMagic)}
                  className="flex flex-col gap-6"
                >
                  <Input
                    label="Email Address"
                    {...magicForm.register("email")}
                    placeholder="you@example.com"
                    icon={<Mail size={18} />}
                    error={magicForm.formState.errors.email?.message}
                  />

                  <MotionButton
                    type="submit"
                    loading={loading}
                    icon={<ArrowRight size={16} />}
                  >
                    Send Magic Link
                  </MotionButton>
                </form>
              )}
              {active === "password" && (
                <form
                  onSubmit={passwordForm.handleSubmit(doSignIn)}
                  className="flex flex-col gap-6"
                >
                  <Input
                    label="Email Address"
                    {...passwordForm.register("email")}
                    placeholder="you@example.com"
                    icon={<Mail size={18} />}
                    error={passwordForm.formState.errors.email?.message}
                  />

                  <Input
                    label="Password"
                    type="password"
                    {...passwordForm.register("password")}
                    placeholder="Enter your password"
                    icon={<Lock size={18} />}
                    error={passwordForm.formState.errors.password?.message}
                  />

                  <MotionButton
                    type="submit"
                    loading={loading}
                    icon={<ArrowRight size={16} />}
                  >
                    Sign In
                  </MotionButton>
                </form>
              )}
              {message && (
                <div
                  className={`mt-4 px-4 py-3 rounded-[8px] text-center text-sm ${
                    message.includes("🎉") || message.includes("Welcome")
                      ? "bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-[#065f46]"
                      : "bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#991b1b]"
                  }`}
                >
                  {message}
                </div>
              )}
              <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm backdrop-blur-sm">
                <span className="text-gray-500">New here?</span>{" "}
                <button
                  onClick={() => router.push("/sign-up")}
                  className="text-[#0d2a5e] font-semibold cursor-pointer hover:opacity-80 transition underline underline-offset-3"
                >
                  Create an account
                </button>
              </div>

            </div>
          </div>
        </main>

        <UnifiedFooter />
      </div>
    </div>
  );
}
