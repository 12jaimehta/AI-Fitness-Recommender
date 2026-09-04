"use client";

import React from "react";
import { fade, motion, transition } from "@/components/shared/Motion";
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
                {...fade}
                transition={transition}
                className="absolute inset-0 bg-[#282828] rounded-lg shadow-sm"
              />
            )}

            {/* Content on top */}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
