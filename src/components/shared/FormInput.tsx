"use client";

import { cn } from "@/lib/utils";
import { FormInputProps } from "../../lib/types";

export default function FormInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
}: FormInputProps) {
  const inputValue = value === undefined || value === null ? "" : String(value);
  return (
    <div className="text-left">
      <label className="mb-2 block text-sm font-semibold text-fyte-ink">
        {label}
        {required ? <span> *</span> : null}
      </label>
      <input
        type={type}
        inputMode={type === "number" ? "decimal" : undefined}
        value={inputValue}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onWheel={(e) => (e.target as HTMLInputElement).blur()}
        className={cn(
          "h-12 w-full rounded-xl border-2 bg-fyte-card px-4 text-base font-medium text-fyte-ink outline-none transition placeholder:text-gray-400",
          error ? "border-fyte-danger" : "border-fyte-line focus:border-fyte-ink",
          disabled && "cursor-not-allowed opacity-50"
        )}
      />
      {error ? (
        <p className="mt-2 text-sm font-medium text-fyte-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
