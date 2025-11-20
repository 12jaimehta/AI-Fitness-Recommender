"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = { key: string; label: string; icon?: React.ReactNode };

export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: Tab[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-colors",
              isActive ? "text-white" : "text-gray-600"
            )}
          >
            {/* Fade-in background */}
            {isActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-0 bg-[#162a41] rounded-lg shadow-sm"
              />
            )}

            {/* Content on top */}
            <motion.span
              className="relative z-10 flex items-center gap-2"
              animate={{
                scale: isActive ? 1.03 : 1,
                opacity: isActive ? 1 : 0.75,
              }}
              transition={{ duration: 0.15 }}
            >
              {tab.icon}
              {tab.label}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}
