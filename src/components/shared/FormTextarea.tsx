"use client";

import { cn } from "@/lib/utils";

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  hint,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  rows?: number;
}) {
  return (
    <div className="text-left">
      <label className="mb-3 block text-sm font-semibold text-fyte-ink">
        {label}
        {required ? <span> *</span> : null}
      </label>
      {hint ? <p className="mb-3 text-sm text-fyte-muted">{hint}</p> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        aria-invalid={Boolean(error)}
        className={cn(
          "w-full rounded-xl border-2 bg-fyte-card px-4 py-3 text-sm font-medium text-fyte-ink outline-none transition",
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
