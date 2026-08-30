"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function InlineLoader({ title = "Loading ..." }: { title?: string }) {
  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center pt-20">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
        <Activity size={40} color="#282828" />
      </motion.div>
      <p className="mt-4 text-sm text-slate-500">{title}</p>
    </div>
  );
}
