"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export default function OptionChipGrid({
  label,
  options,
  selected,
  onToggle,
  error,
}: {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-900 mb-3">
        {label}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {options.map((opt) => {
          const active = selected.includes(opt.value);
          return (
            <motion.button
              type="button"
              key={opt.value}
              onClick={() => onToggle(opt.value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-semibold border-2 transition-colors duration-200",
                active
                  ? "bg-[#282828] text-white border-[#282828] shadow-[0_12px_30px_rgba(22,42,65,0.18)]"
                  : "bg-white text-slate-900 border-slate-200 hover:border-[#454545]"
              )}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
