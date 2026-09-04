"use client";

import { motion, press } from "@/components/shared/Motion";
import { cn } from "@/lib/utils";
import OptionMenu from "@/components/shared/OptionMenu";

type Option = { value: string; label: string };

export default function OptionChipGrid({
  label,
  options,
  selected,
  onToggle,
  error,
  hint,
  required = false,
  variant = "chips",
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  variant?: "chips" | "dropdown";
}) {
  return (
    <div className="font-['Montserrat',sans-serif]">
      <label className="mb-3 block text-sm font-semibold text-[#282828]">
        {label}
        {required ? <span> *</span> : null}
      </label>
      {hint ? <p className="mb-3 text-sm text-gray-500">{hint}</p> : null}

      {variant === "dropdown" ? (
        <OptionMenu
          options={options}
          selected={selected}
          onToggle={onToggle}
          multiple
          placeholder="Choose"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {options.map((opt) => {
            const active = selected.includes(opt.value);
            return (
              <motion.button
                type="button"
                key={opt.value}
                onClick={() => onToggle(opt.value)}
                {...press}
                className={cn(
                  "rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-colors duration-200",
                  active
                    ? "border-[#282828] bg-[#282828] text-white"
                    : "border-gray-200 bg-white text-[#282828] hover:border-[#282828]"
                )}
              >
                {opt.label}
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
