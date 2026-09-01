"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  BarController,
  LineElement,
  BarElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import type { AnalyticsPoint } from "@/shared/types";

let registered = false;

function ensureChart() {
  if (registered) return;
  Chart.register(
    LineController,
    BarController,
    LineElement,
    BarElement,
    PointElement,
    LinearScale,
    CategoryScale,
    Filler,
    Tooltip,
    Legend
  );
  Chart.defaults.font.family = "Montserrat, system-ui, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = "#6b7280";
  registered = true;
}

function tooltipTitle(points: AnalyticsPoint[], bucket: "day" | "month", index: number) {
  const point = points[index];
  if (!point) return "";
  if (bucket === "month") return point.label;
  const [year, month, day] = point.date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TrendChart({
  kind,
  points,
  bucket = "day",
}: {
  kind: "diet" | "workout";
  points: AnalyticsPoint[];
  bucket?: "day" | "month";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;

    ensureChart();
    chartRef.current?.destroy();

    const labels = points.map((point) => point.label);
    const maxWorkouts = Math.max(0, ...points.map((point) => point.workouts));
    const hasBurn = points.some((point) => point.workout_kcal > 0);

    const dietDatasets: ChartConfiguration["data"]["datasets"] = [
      {
        type: "line",
        label: "Calories",
        data: points.map((point) => point.calories),
        borderColor: "#282828",
        backgroundColor: "rgba(40, 40, 40, 0.14)",
        fill: true,
        tension: 0.3,
        pointRadius: points.length > 40 ? 0 : 3,
        pointHoverRadius: 6,
        pointBackgroundColor: "#282828",
        yAxisID: "y",
      },
      {
        type: "line",
        label: "Protein (g)",
        data: points.map((point) => point.protein_g),
        borderColor: "#6b7280",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.3,
        borderDash: [5, 4],
        pointRadius: points.length > 40 ? 0 : 3,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ];

    const workoutDatasets: ChartConfiguration["data"]["datasets"] = [
      {
        type: "bar",
        label: "Workouts",
        data: points.map((point) => point.workouts),
        backgroundColor: "#282828",
        borderRadius: 6,
        maxBarThickness: bucket === "day" ? 18 : 36,
        yAxisID: "y",
      },
    ];
    if (hasBurn) {
      workoutDatasets.push({
        type: "line",
        label: "Burn (kcal)",
        data: points.map((point) => point.workout_kcal),
        borderColor: "#6b7280",
        backgroundColor: "transparent",
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: "y1",
      });
    }

    const showRightAxis = kind === "diet" || hasBurn;

    const config: ChartConfiguration = {
      type: kind === "workout" ? "bar" : "line",
      data: {
        labels,
        datasets: kind === "diet" ? dietDatasets : workoutDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            display: kind === "diet" || hasBurn,
            position: "bottom",
            labels: { usePointStyle: true, boxWidth: 8, padding: 16 },
          },
          tooltip: {
            backgroundColor: "#282828",
            titleColor: "#fff",
            bodyColor: "#fff",
            padding: 10,
            callbacks: {
              title: (items) => tooltipTitle(points, bucket, items[0]?.dataIndex ?? 0),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: bucket === "day" ? 8 : 12,
            },
          },
          y: {
            beginAtZero: true,
            grace: "8%",
            ticks: {
              precision: 0,
              ...(kind === "workout" && maxWorkouts <= 8 ? { stepSize: 1 } : {}),
            },
            grid: { color: "#f3f4f6" },
            title: {
              display: true,
              text: kind === "diet" ? "kcal" : "sessions",
              color: "#9ca3af",
              font: { size: 11 },
            },
          },
          y1: {
            display: showRightAxis,
            beginAtZero: true,
            grace: "8%",
            position: "right",
            grid: { display: false },
            ticks: { precision: 0 },
            title: {
              display: true,
              text: kind === "diet" ? "protein g" : "kcal",
              color: "#9ca3af",
              font: { size: 11 },
            },
          },
        },
      },
    };

    chartRef.current = new Chart(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [kind, bucket, points]);

  if (!points.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">No data yet</div>
    );
  }

  return (
    <div className="relative h-64 sm:h-72">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={kind === "diet" ? "Calories and protein over time" : "Workouts over time"}
      />
    </div>
  );
}
