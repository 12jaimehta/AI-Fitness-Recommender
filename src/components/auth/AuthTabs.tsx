// components/auth/AuthTabs.tsx
"use client";

import { Mail, User } from "lucide-react";
import React from "react";

type TabKey = "password" | "magic";

export default function AuthTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
}) {
  const tabs: { key: TabKey; label: string; icon: React.ComponentType<any> }[] = [
    { key: "password", label: "Password", icon: User },
    { key: "magic", label: "Magic Link", icon: Mail },
  ];

  return (
    <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition ${
              isActive ? "bg-[#282828] text-white" : "text-gray-600"
            }`}
            type="button"
          >
            <Icon size={16} />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
