"use client";

import { motion } from "framer-motion";
import { CheckCircle2, type LucideIcon } from "lucide-react";
import { clampSize, isMobile } from "./planDisplayUtils";

export default function PlanTips({
  title,
  icon: Icon,
  tips,
}: {
  title: string;
  icon: LucideIcon;
  tips?: string[];
}) {
  if (!tips || tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div
        style={{
          background: "rgba(22, 42, 65, 0.02)",
          border: "2px solid rgba(22, 42, 65, 0.1)",
          borderRadius: "16px",
          padding: "30px",
        }}
      >
        <h3
          style={{
            fontSize: clampSize(20, 24),
            fontWeight: "700",
            color: "#282828",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Icon size={24} color="#282828" />
          {title}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile() ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "15px",
          }}
        >
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              style={{
                display: "flex",
                gap: "10px",
                padding: "15px",
                background: "rgba(22, 42, 65, 0.03)",
                borderRadius: "12px",
                border: "1px solid rgba(22, 42, 65, 0.1)",
              }}
            >
              <CheckCircle2 size={18} color="#282828" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span
                style={{
                  color: "#374151",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  fontWeight: "500",
                }}
              >
                {tip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
