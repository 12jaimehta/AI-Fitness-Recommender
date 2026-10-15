"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function OtpCodeInput({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.replace(/\D/g, "").slice(0, 6);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="text-left">
      <label className="mb-2 block text-sm font-semibold text-fyte-ink" htmlFor="otp-code">
        6-digit code <span>*</span>
      </label>
      <div className="relative">
        <input
          id="otp-code"
          ref={inputRef}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          disabled={disabled}
          value={digits}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          aria-invalid={Boolean(error)}
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
        />
        <div className="flex justify-between gap-2">
          {Array.from({ length: 6 }, (_, index) => (
            <span
              key={index}
              className={cn(
                "flex h-14 w-12 items-center justify-center rounded-xl border-2 bg-fyte-card text-2xl font-extrabold text-fyte-ink sm:h-16 sm:w-14",
                error ? "border-fyte-danger" : digits.length === index ? "border-fyte-ink" : "border-fyte-line"
              )}
            >
              {digits[index] || ""}
            </span>
          ))}
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-sm font-medium text-fyte-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
