// components/ui/password-input.tsx
"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | undefined;
};

export default function PasswordInput({ label, error, className = "", ...props }: Props) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-[#162a41]">{label}</label>}
      <div className="relative">
        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          {...props}
          type={show ? "text" : "password"}
          className={cn(
            "w-full rounded-xl py-3 px-4 border text-base focus:outline-none transition pl-12 pr-12",
            error ? "border-red-500 focus:ring-2 focus:ring-red-100" : "border-gray-300 focus:ring-2 focus:ring-[#162a411A]",
            className
          )}
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
