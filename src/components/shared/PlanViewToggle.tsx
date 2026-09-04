"use client";

import { FadeIn, Press } from "@/components/shared/Motion";
import { Sun, Calendar } from "lucide-react";

export default function PlanViewToggle({
  activeView,
  onViewChange,
}: {
  activeView: "single" | "weekly";
  onViewChange: (view: "single" | "weekly") => void;
}) {
  const tabs = [
    { id: "single" as const, label: "Daily View", icon: Sun },
    { id: "weekly" as const, label: "Weekly View", icon: Calendar },
  ];

  return (
    <FadeIn delay={0.08} style={{ marginBottom: "40px" }}>
      <div
        style={{
          display: "flex",
          background: "rgba(22, 42, 65, 0.05)",
          borderRadius: "12px",
          padding: "4px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {tabs.map((tab) => (
          <Press
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: activeView === tab.id ? "#282828" : "transparent",
              color: activeView === tab.id ? "#ffffff" : "#282828",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </Press>
        ))}
      </div>
    </FadeIn>
  );
}
