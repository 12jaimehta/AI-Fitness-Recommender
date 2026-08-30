"use client";

import { motion } from "framer-motion";
import { RefreshCw, RotateCcw, type LucideIcon } from "lucide-react";
import { clampSize, isMobile } from "./planDisplayUtils";

export type PlanHeaderExtraAction = {
  label: string;
  loadingLabel?: string;
  loading?: boolean;
  icon: LucideIcon;
  onClick: () => void;
};

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: "center", marginBottom: "50px" }}
    >
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

      <motion.div
        style={{
          display: "flex",
          gap: "15px",
          justifyContent: "center",
          flexWrap: "wrap",
          flexDirection: isMobile() ? "column" : "row",
          alignItems: "center",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileHover={
            !loading
              ? {
                  scale: 1.05,
                  boxShadow: "0 15px 35px rgba(22, 42, 65, 0.3)",
                }
              : {}
          }
          whileTap={!loading ? { scale: 0.95 } : {}}
          onClick={onRegenerate}
          disabled={loading}
          style={{
            background: loading ? "#9ca3af" : "#282828",
            color: "#ffffff",
            border: "none",
            padding: "14px 28px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            minWidth: "140px",
            justifyContent: "center",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
        >
          <RefreshCw size={18} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Generating..." : "Regenerate"}
        </motion.button>

        <motion.button
          whileHover={{
            scale: 1.05,
            boxShadow: "0 8px 25px rgba(22, 42, 65, 0.2)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewPlan}
          style={{
            background: "#ffffff",
            color: "#282828",
            border: "2px solid #282828",
            padding: "14px 28px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            minWidth: "140px",
            justifyContent: "center",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 10 }}
        >
          <RotateCcw size={18} />
          New Plan
        </motion.button>

        {extraAction && (
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 25px rgba(22, 42, 65, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={extraAction.onClick}
            disabled={extraAction.loading}
            style={{
              background: extraAction.loading ? "#9ca3af" : "#ffffff",
              color: extraAction.loading ? "#666666" : "#282828",
              border: "2px solid #282828",
              padding: "14px 28px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: extraAction.loading ? "not-allowed" : "pointer",
              opacity: extraAction.loading ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.3s ease",
              minWidth: "140px",
              justifyContent: "center",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 10 }}
          >
            <extraAction.icon
              size={18}
              style={{ animation: extraAction.loading ? "pulse 1s linear infinite" : "none" }}
            />
            {extraAction.loading
              ? extraAction.loadingLabel || extraAction.label
              : extraAction.label}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
