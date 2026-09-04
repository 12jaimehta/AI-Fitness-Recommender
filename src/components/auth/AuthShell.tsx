"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UnifiedFooter } from "@/components";

export const authInputClass =
  "mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#282828]";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();

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
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          {children}
        </div>
      </main>

      <UnifiedFooter />
    </div>
  );
}

export function AuthAlert({
  message,
  tone = "error",
}: {
  message: string | null;
  tone?: "error" | "success";
}) {
  if (!message) return null;
  const ok = tone === "success";
  return (
    <p
      className={`mt-4 rounded-xl px-4 py-3 text-sm ${
        ok
          ? "border border-gray-200 bg-gray-50 text-gray-700"
          : "border border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message}
    </p>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-gray-200" />
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">or</span>
      <div className="h-px flex-1 bg-gray-200" />
    </div>
  );
}
