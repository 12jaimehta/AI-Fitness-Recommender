"use client";

import React from "react";

export default function SurfaceCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 ${className}`}
      style={{
        border: "2px solid rgba(22, 42, 65, 0.1)",
      }}
    >
      {children}
    </div>
  );
}
