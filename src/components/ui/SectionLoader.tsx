"use client";

import { motion } from "framer-motion";

export default function SectionLoader({
  title = "Loading...",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[12rem] flex-col items-center justify-center px-4 py-10 ${className}`}>
      <motion.div
        className="h-10 w-10 rounded-full border-4 border-[#282828]/20 border-t-[#282828]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="mt-4 text-sm text-gray-600">{title}</p>
    </div>
  );
}
