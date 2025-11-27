"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/supabase-client";
import { signUpSchema, SignUpForm } from "@/lib/validation/signUpSchema";

import Tabs from "@/components/ui/Tabs";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordInput";

import AuthLeftSection from "@/components/auth/AuthLeftSection";
import PasswordStrength from "@/components/auth/PasswordStrength";
import UnifiedFooter from "@/components/shared/UnifiedFooter";
import MotionButton from "@/components/ui/MotionButton";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const [active, setActive] = useState<"password" | "magic">("password");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  const { register, handleSubmit, watch, formState } = form;
  const errors = formState.errors;
  const watchedPassword = watch("password", "");

  const onSubmit = async (values: SignUpForm) => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { full_name: values.fullName } },
    });

    setLoading(false);
    if (error) setMessage(error.message);
    else if (data?.user) {
      setMessage(" Account created successfully! Check your email to verify your account.");
      setTimeout(() => router.push("/dashboard"), 3000);
    }
  };

  const handleMagic = async (vals: { email: string }) => {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({ email: vals.email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setLoading(false);
    if (error) setMessage(error.message);
    else setMessage("Magic link sent! Check your email.");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#282828_0%,#1e3a5f_100%)] relative overflow-hidden">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="py-8">
          <div className="max-w-[1200px] mx-auto px-8 flex justify-between items-center">
            <div className="flex items-center gap-3 text-white text-[28px] font-extrabold cursor-pointer" onClick={() => router.push("/")}>
              fyteAI
            </div>

            <button onClick={() => router.push("/sign-in")} className="px-6 py-3 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition-all hover:scale-105 cursor-pointer">
              Already have an account?
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-[1200px] w-full items-center">
            <AuthLeftSection />

            <div className="bg-white p-10 rounded-3xl shadow-xl border border-white/30">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold text-[#282828]">Create Your Account</h2>
                <p className="text-gray-600">Join fyteAI and transform your fitness journey</p>
              </div>

              <Tabs
                tabs={[
                  { key: "password", label: "Create Account", icon: <User size={16} /> },
                  { key: "magic", label: "Magic Link", icon: <Mail size={16} /> },
                ]}
                active={active}
                onChange={(k) => setActive(k as "password" | "magic")}
              />

              {active === "magic" && (
                <form onSubmit={handleSubmit((v) => handleMagic({ email: v.email }))} className="flex flex-col gap-6">
                  <Input label="Email Address" {...register("email")} placeholder="Enter Email Address" error={errors.email?.message as any} icon={<Mail size={18} />} />
                  <MotionButton type="submit" loading={loading} icon={<ArrowRight size={16} />}>
                    {loading ? "Sending Magic Link..." : "Send Magic Link"}
                  </MotionButton>
                </form>
              )}

              {active === "password" && (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                  <Input label="Full name" {...register("fullName")} placeholder="Enter Full Name" icon={<User size={18} />} error={errors.fullName?.message as any} />
                  <Input label="Email Address" {...register("email")} placeholder="Enter Email Address" icon={<Mail size={18} />} error={errors.email?.message as any} />
                  <PasswordInput label="Password" {...register("password")} placeholder="Create a strong password" error={errors.password?.message as any} />
                  {watchedPassword.length > 0 && <PasswordStrength value={watchedPassword} />}
                  <PasswordInput label="Confirm Password" {...register("confirmPassword")} placeholder="Confirm your password" error={errors.confirmPassword?.message as any} />
                  <MotionButton type="submit" loading={loading} icon={<ArrowRight size={16} />}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </MotionButton>
                </form>
              )}

              {message && <div className={`mt-6 p-4 rounded-lg text-center text-sm ${message.includes("Account created successfully") ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"}`}>{message}</div>}

              <div className="mt-10 pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">By creating an account, you agree to our Terms and Privacy Policy.</p>
                <p className="text-sm text-gray-600 mt-4 ">Already have an account? <button onClick={() => router.push("/sign-in")} className="font-semibold text-[#282828] underline underline-offset-2 hover:text-[#1e3a5f] cursor-pointer">Sign in here</button></p>
              </div>
            </div>
          </div>
        </main>

        <UnifiedFooter />
      </div>
    </div>
  );
}
