"use client";

import { Check, X } from "lucide-react";

export default function PasswordStrength({ value }: { value: string }) {
  const checks = [
    { met: value.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(value), text: "One uppercase letter" },
    { met: /[a-z]/.test(value), text: "One lowercase letter" },
    { met: /[0-9]/.test(value), text: "One number" },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(value), text: "One special character" },
  ];

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
      {checks.map((item) => (
        <div
          key={item.text}
          className={`flex items-center gap-2 text-xs ${metClass(item.met)}`}
        >
          {item.met ? <Check size={14} /> : <X size={14} />}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function metClass(met: boolean) {
  return met ? "text-[#282828]" : "text-gray-500";
}
