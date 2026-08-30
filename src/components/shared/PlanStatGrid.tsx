"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { clampSize, isMobile } from "./planDisplayUtils";

export type PlanStatItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export default function PlanStatGrid({
  title,
  items,
}: {
  title: string;
  items: PlanStatItem[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginBottom: "50px" }}
    >
      <h2
        style={{
          fontSize: clampSize(24, 28),
          fontWeight: "700",
          color: "#282828",
          marginBottom: "25px",
          textAlign: "center",
        }}
      >
        {title}
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile()
            ? "repeat(2, 1fr)"
            : "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            style={{
              background: "rgba(22, 42, 65, 0.05)",
              border: "2px solid rgba(22, 42, 65, 0.1)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
              transition: "all 0.3s ease",
            }}
            whileHover={{
              scale: 1.05,
              borderColor: "#282828",
              boxShadow: "0 8px 25px rgba(22, 42, 65, 0.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "50px",
                height: "50px",
                borderRadius: "12px",
                background: "#282828",
                margin: "0 auto 15px",
              }}
            >
              <item.icon size={24} color="#ffffff" />
            </div>
            <div
              style={{
                fontSize: clampSize(20, 24),
                fontWeight: "700",
                color: "#282828",
                marginBottom: "5px",
              }}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
