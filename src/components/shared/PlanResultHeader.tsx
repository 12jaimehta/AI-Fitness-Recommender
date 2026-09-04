"use client";

import { FadeIn, Press } from "@/components/shared/Motion";
import { RefreshCw, RotateCcw, type LucideIcon } from "lucide-react";
import { clampSize, isMobile } from "./planDisplayUtils";

export type PlanHeaderExtraAction = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  icon: LucideIcon;
  onClick: () => void;
};

const actionStyle = {
  padding: "14px 28px",
  borderRadius: "12px",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  minWidth: "140px",
  justifyContent: "center",
} as const;

export default function PlanResultHeader({
  icon: Icon,
  title,
  subtitle,
  loading,
  onRegenerate,
  onNewPlan,
  extraAction,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  loading: boolean;
  onRegenerate: () => void;
  onNewPlan: () => void;
  extraAction?: PlanHeaderExtraAction;
}) {
  return (
    <FadeIn style={{ textAlign: "center", marginBottom: "50px" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "80px",
          height: "80px",
          borderRadius: "20px",
          background: "#282828",
          marginBottom: "20px",
        }}
      >
        <Icon size={40} color="#ffffff" />
      </div>

      <h1
        style={{
          fontSize: clampSize(32, 48),
          fontWeight: "800",
          color: "#282828",
          marginBottom: "15px",
        }}
      >
        {title}
      </h1>
      <p style={{ color: "#6b7280", fontSize: clampSize(16, 18), marginBottom: "30px" }}>
        {subtitle}
      </p>

      <FadeIn
        delay={0.08}
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          flexWrap: "wrap",
          flexDirection: isMobile() ? "column" : "row",
          alignItems: "center",
        }}
      >
        <Press
          enabled={!loading}
          onClick={onRegenerate}
          disabled={loading}
          style={{
            ...actionStyle,
            background: loading ? "#9ca3af" : "#282828",
            color: "#ffffff",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          <RefreshCw size={18} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Generating..." : "Regenerate"}
        </Press>

        <Press
          onClick={onNewPlan}
          style={{
            ...actionStyle,
            background: "#ffffff",
            color: "#282828",
            border: "2px solid #282828",
            cursor: "pointer",
          }}
        >
          <RotateCcw size={18} />
          New Plan
        </Press>

        {extraAction && (
          <Press
            enabled={!extraAction.loading}
            onClick={extraAction.onClick}
            disabled={extraAction.loading}
            style={{
              ...actionStyle,
              background: extraAction.loading ? "#9ca3af" : "#ffffff",
              color: extraAction.loading ? "#666666" : "#282828",
              border: "2px solid #282828",
              cursor: extraAction.loading ? "not-allowed" : "pointer",
              opacity: extraAction.loading ? 0.7 : 1,
            }}
          >
            <extraAction.icon
              size={18}
              style={{ animation: extraAction.loading ? "pulse 1s linear infinite" : "none" }}
            />
            {extraAction.loading
              ? extraAction.loadingLabel || extraAction.label
              : extraAction.label}
          </Press>
        )}
      </FadeIn>
    </FadeIn>
  );
}
