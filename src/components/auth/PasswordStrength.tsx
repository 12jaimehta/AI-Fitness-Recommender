"use client";

import { Check, X } from "lucide-react";

export default function PasswordStrength({
  value,
}: {
  value: string;
}) {
  const checks = {
    minLength: value.length >= 8,
    hasUpperCase: /[A-Z]/.test(value),
    hasLowerCase: /[a-z]/.test(value),
    hasNumber: /[0-9]/.test(value),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
  };

  return (
    <div className="mt-3 p-4 bg-gray-100 rounded-lg flex flex-col gap-2">
      <Requirement met={checks.minLength} text="At least 8 characters" />
      <Requirement met={checks.hasUpperCase} text="One uppercase letter" />
      <Requirement met={checks.hasLowerCase} text="One lowercase letter" />
      <Requirement met={checks.hasNumber} text="One number" />
      <Requirement met={checks.hasSpecialChar} text="One special character" />
    </div>
  );
}

function Requirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-green-600" : "text-gray-500"}`}>
      {met ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );
}
