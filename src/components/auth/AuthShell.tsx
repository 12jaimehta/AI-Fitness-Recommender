"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { FadeIn, motion, enter } from "@/components/shared/Motion";

const POINTS = [
  "Meals with real numbers, not vibes",
  "Log a cheat meal in one sentence or a photo",
  "The coach fixes one slot, never the whole plan",
];

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fyte-page lg:grid lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-black text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Image src="/home/photos/photo3.jpg" alt="" fill priority sizes="55vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <Link href="/" className="relative text-2xl font-extrabold tracking-tight text-shadow-md">
          fyteAI
        </Link>
        <div className="relative max-w-md">
          <motion.h2 {...enter(0.04)} className="text-[clamp(32px,3.4vw,48px)] font-extrabold leading-[1.05] tracking-tight text-shadow-lg">
            A trainer who notices what you actually did.
          </motion.h2>
          <ul className="mt-8 space-y-3">
            {POINTS.map((point, index) => (
              <motion.li key={point} {...enter(0.1 + index * 0.05)} className="flex items-center gap-3 text-white/85">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur-md">
                  <Check size={14} />
                </span>
                {point}
              </motion.li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">© 2026 fyteAI</p>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-10 lg:min-h-0 lg:justify-center lg:py-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-fyte-ink">
            fyteAI
          </Link>
          <Link href="/" className="text-sm font-semibold text-fyte-muted hover:text-fyte-ink">
            Back to home
          </Link>
        </div>
        <FadeIn className="mx-auto mt-10 w-full max-w-md lg:mt-0">
          <h1 className="text-3xl font-extrabold tracking-tight text-fyte-ink">{title}</h1>
          <p className="mt-2 text-sm text-fyte-muted">{subtitle}</p>
          {children}
        </FadeIn>
        <p className="mx-auto mt-10 w-full max-w-md text-center text-xs text-fyte-muted lg:mt-12">
          <Link href="/terms" className="hover:text-fyte-ink">Terms</Link> · <Link href="/privacy" className="hover:text-fyte-ink">Privacy</Link> ·{" "}
          <Link href="/help" className="hover:text-fyte-ink">Help</Link>
        </p>
      </main>
    </div>
  );
}

export function AuthAlert({ message, tone = "error" }: { message: string | null; tone?: "error" | "success" }) {
  if (!message) return null;
  const ok = tone === "success";
  return (
    <p
      role={ok ? "status" : "alert"}
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${ok ? "bg-fyte-ink text-white" : "border border-red-200 bg-red-50 text-red-700"}`}
    >
      {message}
    </p>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-fyte-line" />
      <span className="text-xs font-semibold uppercase tracking-wide text-fyte-muted">or</span>
      <div className="h-px flex-1 bg-fyte-line" />
    </div>
  );
}
