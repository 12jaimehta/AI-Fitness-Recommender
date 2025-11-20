// components/ui/GenderSelectCard.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option = { value: string; icon: React.ReactNode; label: string; description?: string };
type Props = {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
};

export default function GenderSelectCard({ options, value, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <motion.button
            type="button"
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative rounded-xl p-5 text-left border transition-shadow duration-200",
              active
                ? "bg-[#162a41] text-white shadow-[0_12px_30px_rgba(22,42,65,0.18)] border-[#162a41]"
                : "bg-white text-gray-800 border-gray-200 hover:shadow-md"
            )}
          >
            <div className="text-4xl mb-3">{opt.icon}</div>
            <div className="font-semibold text-lg">{opt.label}</div>
            {opt.description && <div className={cn("text-sm mt-1", active ? "text-gray-200" : "text-gray-500")}>{opt.description}</div>}
          </motion.button>
        );
      })}
    </div>
  );
}
