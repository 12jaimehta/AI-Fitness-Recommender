// components/ui/NutritionCard.tsx
"use client";

import { motion } from "framer-motion";
import React from "react";

type Props = {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color?: string;
  index?: number;
};

export default function NutritionCard({ label, value, icon: Icon, color = "bg-indigo-500", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12 + index * 0.06 }}
      className="rounded-xl border border-white/6 p-5 text-center"
      style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))" }}
    >
      <div className={`w-14 h-14 mx-auto rounded-lg flex items-center justify-center ${color} text-white mb-3`}>
        <Icon size={20} />
      </div>
      <div className="text-xs text-gray-400 uppercase tracking-wider">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-white">{value}</div>
    </motion.div>
  );
}
