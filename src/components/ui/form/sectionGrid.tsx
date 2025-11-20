"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  cols?: number; // 1 or 2
  gap?: string;
  className?: string;
};

export default function SectionGrid({ children, cols = 2, gap = "gap-6", className = "" }: Props) {
  const gridCols = cols === 2 ? "grid-cols-2" : "grid-cols-1";
  return <div className={`grid ${gridCols} ${gap} ${className}`}>{children}</div>;
}
