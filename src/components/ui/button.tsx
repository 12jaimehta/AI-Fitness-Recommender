// components/ui/button.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "secondary";
  loading?: boolean;
  icon?: React.ReactNode;
};

export default function Button({ className = "", children, variant = "primary", loading, icon, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition";
  const styles = {
    primary: "bg-[#282828] text-white hover:bg-[#1e3a5f]",
    ghost: "bg-white/10 text-white hover:bg-white/20",
    outline: "border border-white/30 text-white bg-transparent",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  } as const;

  return (
    <button
      {...props}
      className={cn(
        base,
        "px-4 py-2",
        styles[variant],
        loading ? "opacity-70 cursor-not-allowed" : "",
        className
      )}
      disabled={props.disabled || loading}
    >
      {loading && <span className="w-4 h-4 rounded-full border-2 border-transparent border-t-white animate-spin mr-2" />}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
