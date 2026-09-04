"use client";

import { motion, pressWhen } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import { FormSelectProps } from "../../lib/types";
import OptionMenu from "@/components/shared/OptionMenu";

export default function FormSelect({
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  hint,
  columns = 2,
  compact = false,
  variant = "chips",
}: FormSelectProps) {
  const selectValue = value === undefined || value === null ? "" : String(value);
  const choices = options.filter((option) => option.value !== "");
  const placeholder = options.find((option) => option.value === "")?.label || "Choose";

  const columnClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2";

  const pick = (next: string) => {
    if (!required && next === selectValue) {
      onChange?.("");
      return;
    }
    onChange?.(next);
  };

  return (
    <div className={cn("text-left font-['Montserrat',sans-serif]", disabled && "pointer-events-none opacity-50")}>
      {label ? (
        <label className="mb-3 block text-sm font-semibold text-fyte-ink">
          {label}
          {required ? <span> *</span> : null}
        </label>
      ) : null}
      {hint ? <p className="mb-3 text-sm text-fyte-muted">{hint}</p> : null}

      {variant === "dropdown" ? (
        <OptionMenu
          options={choices}
          selected={selectValue ? [selectValue] : []}
          onToggle={pick}
          placeholder={placeholder}
          disabled={disabled}
          compact={compact}
        />
      ) : (
        <div className={cn("grid gap-3", compact && "gap-2", columnClass)}>
          {choices.map((option) => {
            const active = selectValue === option.value;
            return (
              <motion.button
                type="button"
                key={option.value}
                disabled={disabled || option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  pick(option.value);
                }}
                {...pressWhen(!(disabled || option.disabled))}
                className={cn(
                  "rounded-xl border-2 text-left font-semibold transition",
                  compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm",
                  active
                    ? "border-fyte-ink bg-fyte-ink text-white"
                    : error
                      ? "border-red-300 bg-fyte-card text-fyte-ink hover:border-fyte-ink"
                      : "border-fyte-line bg-fyte-card text-fyte-ink hover:border-fyte-ink",
                  option.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {option.label}
              </motion.button>
            );
          })}
        </div>
      )}
      {error ? (
        <p className="mt-2 text-sm font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
