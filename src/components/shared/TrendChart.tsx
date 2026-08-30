"use client";

import type { ChartPoint } from "@/shared/types";

export default function TrendChart({
  points,
  unit = "kcal",
}: {
  points: ChartPoint[];
  unit?: string;
}) {
  const width = 640;
  const height = 180;
  const padX = 8;
  const padY = 16;
  const values = points.map((p) => Number(p.value) || 0);
  const max = Math.max(...values, 1);
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const step = points.length > 1 ? innerW / (points.length - 1) : innerW;

  const coords = values.map((value, i) => {
    const x = padX + i * step;
    const y = padY + innerH - (value / max) * innerH;
    return { x, y, value };
  });

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${coords[coords.length - 1]?.x ?? padX} ${height - padY} L ${padX} ${height - padY} Z`;

  const labelEvery = points.length > 16 ? 5 : points.length > 12 ? 2 : 1;

  if (!points.length) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-400">No data yet</div>
    );
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" role="img" aria-label="Progress chart">
        <defs>
          <linearGradient id="trackFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#282828" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#282828" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trackFill)" />
        <path d={line} fill="none" stroke="#282828" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
        {points.map((point, i) => (
          <span key={`${point.label}-${i}`} className="flex-1 text-center">
            {i % labelEvery === 0 || i === points.length - 1 ? point.label : ""}
          </span>
        ))}
      </div>
      <p className="sr-only">{unit}</p>
    </div>
  );
}
