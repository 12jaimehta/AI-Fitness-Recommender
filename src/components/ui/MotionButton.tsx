// components/ui/motion-button.tsx
"use client";

import { motion, pressWhen } from "@/components/shared/Motion";
import type { MotionProps } from "framer-motion";
import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & MotionProps & {
  loading?: boolean;
  icon?: React.ReactNode;
  variant?: "primary" | "ghost" | "outline" | "secondary";
};

const variants = {
  primary: "bg-[#282828] text-white hover:bg-[#262626]",
  ghost: "bg-white/10 text-white hover:bg-white/20",
  outline: "border border-white/30 text-white bg-transparent",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
} as const;

export default function MotionButton({ children, loading = false, icon, variant = "primary", className = "", disabled, ...props }: Props) {
  return (
    <motion.button
      {...(props as any)}
      disabled={disabled || loading}
      {...pressWhen(!loading)}
      className={cn("w-full px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition whitespace-nowrap", variants[variant], loading ? "opacity-70 cursor-not-allowed" : "", className)}
    >
      {loading && <span className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin mr-2" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}
