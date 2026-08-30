import type { ProgressAnalytics, TrackRange } from "@/shared/types";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { throwIfSchemaMissing } from "./db";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export function analyticsWindow(range: TrackRange | string) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = todayIso();

  if (range === "year") {
    return { from: `${year}-01-01`, to: today, bucket: "month" as const, year, month: 0 };
  }
  if (range === "last_year") {
    return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31`, bucket: "month" as const, year: year - 1, month: 0 };
  }
  if (range === "7d") {
    const from = new Date(Date.UTC(year, month, now.getUTCDate() - 6));
    return { from: from.toISOString().slice(0, 10), to: today, bucket: "day" as const, year, month };
  }
  if (range === "90d") {
    const from = new Date(Date.UTC(year, month, now.getUTCDate() - 89));
    return { from: from.toISOString().slice(0, 10), to: today, bucket: "day" as const, year, month };
  }
  return {
    from: `${year}-${pad(month + 1)}-01`,
    to: today,
    bucket: "day" as const,
    year,
    month,
  };
}

export async function getProgressAnalytics(range: string): Promise<ProgressAnalytics> {
  const { supabase, user } = await requireUser();
  const window = analyticsWindow(range);

  const [mealsRes, workoutsRes] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("date, total_calories, total_protein_g")
      .eq("user_id", user.id)
      .gte("date", window.from)
      .lte("date", window.to),
    supabase
      .from("workout_logs")
      .select("date, is_completed")
      .eq("user_id", user.id)
      .gte("date", window.from)
      .lte("date", window.to),
  ]);
  throwIfSchemaMissing(mealsRes.error);
  throwIfSchemaMissing(workoutsRes.error);
  if (mealsRes.error) throw new ApiError(mealsRes.error.message, 400);
  if (workoutsRes.error) throw new ApiError(workoutsRes.error.message, 400);

  const meals = mealsRes.data || [];
  const workouts = workoutsRes.data || [];

  const caloriesByDate = new Map<string, { calories: number; protein: number }>();
  for (const row of meals) {
    const key = String(row.date).slice(0, 10);
    const prev = caloriesByDate.get(key) || { calories: 0, protein: 0 };
    caloriesByDate.set(key, {
      calories: prev.calories + Number(row.total_calories || 0),
      protein: prev.protein + Number(row.total_protein_g || 0),
    });
  }
  const workoutDates = new Set(
    workouts.filter((row) => row.is_completed).map((row) => String(row.date).slice(0, 10))
  );

  let points: ProgressAnalytics["points"] = [];
  if (window.bucket === "day") {
    const start = new Date(`${window.from}T00:00:00Z`);
    const end = new Date(`${window.to}T00:00:00Z`);
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const macros = caloriesByDate.get(key) || { calories: 0, protein: 0 };
      points.push({
        label: String(d.getUTCDate()),
        calories: macros.calories,
        protein_g: macros.protein,
        workout: workoutDates.has(key),
      });
    }
  } else {
    const byMonth = MONTHS.map((label) => ({ label, calories: 0, protein_g: 0, workout: false }));
    for (const [key, macros] of caloriesByDate) {
      const m = Number(key.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) {
        byMonth[m].calories += macros.calories;
        byMonth[m].protein_g += macros.protein;
      }
    }
    for (const key of workoutDates) {
      const m = Number(key.slice(5, 7)) - 1;
      if (m >= 0 && m < 12) byMonth[m].workout = true;
    }
    points = byMonth;
  }

  return {
    range,
    from: window.from,
    to: window.to,
    summary: {
      streak_days: 0,
      avg_adherence_pct: 0,
      total_workouts_completed: workoutDates.size,
      meals_logged: meals.length,
    },
    points,
  };
}
