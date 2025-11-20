// components/ui/input.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | undefined;
  icon?: React.ReactNode;
};

export default function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-[#162a41]">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">{icon}</span>}
        <input
          {...props}
          className={cn(
            "w-full rounded-xl py-3 px-4 border text-base focus:outline-none transition",
            icon ? "pl-12" : "pl-4",
            error ? "border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-[#162a411A]",
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
