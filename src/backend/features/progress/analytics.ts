import type { AnalyticsPoint, ProgressAnalytics, TrackRange } from "@/shared/types";
import { addDaysIso, eachIsoDate, localIsoDate } from "@/shared/lib/plan-tracking";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { throwIfSchemaMissing } from "./db";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dayLabel(iso: string) {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS[month - 1]}`;
}

function monthLabel(yearMonth: string) {
  const [year, month] = yearMonth.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

function eachYearMonth(from: string, to: string) {
  const months: string[] = [];
  let cur = from.slice(0, 7);
  const end = to.slice(0, 7);
  while (cur <= end) {
    months.push(cur);
    const [year, month] = cur.split("-").map(Number);
    cur = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
    if (months.length > 24) break;
  }
  return months;
}

export function analyticsWindow(range: TrackRange | string) {
  const today = localIsoDate();
  const year = Number(today.slice(0, 4));

  if (range === "year") {
    return { from: `${year}-01-01`, to: today, bucket: "month" as const };
  }
  if (range === "last_year") {
    return { from: `${year - 1}-01-01`, to: `${year - 1}-12-31`, bucket: "month" as const };
  }
  if (range === "7d") {
    return { from: addDaysIso(today, -6), to: today, bucket: "day" as const };
  }
  if (range === "90d") {
    return { from: addDaysIso(today, -89), to: today, bucket: "day" as const };
  }
  return {
    from: `${today.slice(0, 7)}-01`,
    to: today,
    bucket: "day" as const,
  };
}

export function buildAnalyticsPoints({
  from,
  to,
  bucket,
  caloriesByDate,
  workoutsByDate,
}: {
  from: string;
  to: string;
  bucket: "day" | "month";
  caloriesByDate: Map<string, { calories: number; protein: number }>;
  workoutsByDate: Map<string, { sessions: number; kcal: number }>;
}): AnalyticsPoint[] {
  if (bucket === "day") {
    return eachIsoDate(from, to).map((date) => {
      const macros = caloriesByDate.get(date) || { calories: 0, protein: 0 };
      const workout = workoutsByDate.get(date) || { sessions: 0, kcal: 0 };
      return {
        date,
        label: dayLabel(date),
        calories: macros.calories,
        protein_g: macros.protein,
        workouts: workout.sessions,
        workout_kcal: workout.kcal,
      };
    });
  }

  return eachYearMonth(from, to).map((yearMonth) => {
    let calories = 0;
    let protein_g = 0;
    let workouts = 0;
    let workout_kcal = 0;
    for (const [date, macros] of caloriesByDate) {
      if (date.startsWith(yearMonth)) {
        calories += macros.calories;
        protein_g += macros.protein;
      }
    }
    for (const [date, workout] of workoutsByDate) {
      if (date.startsWith(yearMonth)) {
        workouts += workout.sessions;
        workout_kcal += workout.kcal;
      }
    }
    return {
      date: `${yearMonth}-01`,
      label: monthLabel(yearMonth),
      calories,
      protein_g,
      workouts,
      workout_kcal,
    };
  });
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
      .select("date, is_completed, calories_burned_estimated")
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

  const workoutsByDate = new Map<string, { sessions: number; kcal: number }>();
  for (const row of workouts) {
    if (!row.is_completed) continue;
    const key = String(row.date).slice(0, 10);
    const prev = workoutsByDate.get(key) || { sessions: 0, kcal: 0 };
    workoutsByDate.set(key, {
      sessions: prev.sessions + 1,
      kcal: prev.kcal + Number(row.calories_burned_estimated || 0),
    });
  }

  const points = buildAnalyticsPoints({
    from: window.from,
    to: window.to,
    bucket: window.bucket,
    caloriesByDate,
    workoutsByDate,
  });

  const totalWorkouts = [...workoutsByDate.values()].reduce((sum, item) => sum + item.sessions, 0);

  return {
    range,
    from: window.from,
    to: window.to,
    bucket: window.bucket,
    summary: {
      streak_days: 0,
      avg_adherence_pct: 0,
      total_workouts_completed: totalWorkouts,
      meals_logged: meals.length,
    },
    points,
  };
}
