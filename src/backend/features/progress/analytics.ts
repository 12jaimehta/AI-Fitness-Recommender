import type { AnalyticsPoint, ExerciseLogEntry, ProgressAnalytics, TrackRange, WorkoutSetEntry } from "@/shared/types";
import { eachIsoDate, localIsoDate, parseIsoDate } from "@/shared/lib/plan-tracking";
import { trackDaysFromLogs } from "@/shared/lib/daily-track";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { civilDate, throwIfSchemaMissing } from "./db";

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

function lastDayOfMonth(yearMonth: string) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

export function analyticsWindow(range: TrackRange | string, anchor?: string) {
  const date = parseIsoDate(anchor, localIsoDate());
  const today = localIsoDate();
  const asOf = date > today ? date : today;
  const year = date.slice(0, 4);
  const month = date.slice(0, 7);

  if (range === "year") {
    const end = `${year}-12-31`;
    return {
      from: `${year}-01-01`,
      to: asOf < end ? asOf : end,
      bucket: "month" as const,
    };
  }

  const from = `${month}-01`;
  const end = lastDayOfMonth(month);
  return {
    from,
    to: asOf < end ? asOf : end,
    bucket: "day" as const,
  };
}

function asSets(value: unknown): WorkoutSetEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((set, i) => ({
    id: String(set?.id || `set-${i}`),
    kind: set?.kind === "warmup" || set?.kind === "special" ? set.kind : "working",
    weight_kg: Number(set?.weight_kg || 0),
    reps: Number(set?.reps || 0),
  }));
}

function asExercises(value: unknown): ExerciseLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    exercise_id: String(item?.exercise_id || item?.exercise_name || ""),
    exercise_name: String(item?.exercise_name || "Exercise"),
    target_sets: Number(item?.target_sets || 0),
    target_reps: String(item?.target_reps || ""),
    muscle_group: String(item?.muscle_group || ""),
    sets: asSets(item?.sets),
  }));
}

export async function getProgressAnalytics(range: string, date?: string): Promise<ProgressAnalytics> {
  const { supabase, user } = await requireUser();
  const window = analyticsWindow(range, date);

  const [mealsRes, workoutsRes] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("date, total_calories, total_protein_g, source_type")
      .eq("user_id", user.id)
      .gte("date", window.from)
      .lte("date", window.to),
    supabase
      .from("workout_logs")
      .select("date, is_completed, calories_burned_estimated, duration_minutes, exercises_completed")
      .eq("user_id", user.id)
      .gte("date", window.from)
      .lte("date", window.to),
  ]);
  throwIfSchemaMissing(mealsRes.error);
  throwIfSchemaMissing(workoutsRes.error);
  if (mealsRes.error) throw new ApiError(mealsRes.error.message, 400);
  if (workoutsRes.error) throw new ApiError(workoutsRes.error.message, 400);

  const days = trackDaysFromLogs(
    (mealsRes.data || [])
      .map((row) => ({
        date: civilDate(row.date),
        total_calories: Number(row.total_calories || 0),
        total_protein_g: Number(row.total_protein_g || 0),
        source_type: String(row.source_type || ""),
      }))
      .filter((row) => row.date),
    (workoutsRes.data || [])
      .map((row) => ({
        date: civilDate(row.date),
        is_completed: Boolean(row.is_completed),
        exercises_completed: asExercises(row.exercises_completed),
        duration_minutes: Number(row.duration_minutes || 0),
        calories_burned_estimated: row.calories_burned_estimated == null ? null : Number(row.calories_burned_estimated),
      }))
      .filter((row) => row.date)
  );

  const points: AnalyticsPoint[] =
    window.bucket === "day"
      ? eachIsoDate(window.from, window.to).map((iso) => {
          const day = days.get(iso);
          return {
            date: iso,
            label: dayLabel(iso),
            calories: day?.calories || 0,
            protein_g: day?.protein_g || 0,
            workouts: day?.workouts || 0,
            workout_kcal: day?.workout_kcal || 0,
            diet_days: day?.diet_logged ? 1 : 0,
            workout_days: day?.workout_logged ? 1 : 0,
          };
        })
      : eachYearMonth(window.from, window.to).map((yearMonth) => {
          let calories = 0;
          let protein_g = 0;
          let workouts = 0;
          let workout_kcal = 0;
          let diet_days = 0;
          let workout_days = 0;
          for (const [iso, day] of days) {
            if (!iso.startsWith(yearMonth)) continue;
            calories += day.calories;
            protein_g += day.protein_g;
            workouts += day.workouts;
            workout_kcal += day.workout_kcal;
            if (day.diet_logged) diet_days += 1;
            if (day.workout_logged) workout_days += 1;
          }
          return {
            date: `${yearMonth}-01`,
            label: monthLabel(yearMonth),
            calories,
            protein_g,
            workouts,
            workout_kcal,
            diet_days,
            workout_days,
          };
        });

  const totals = [...days.values()].reduce(
    (sum, day) => ({
      calories: sum.calories + day.calories,
      protein: sum.protein + day.protein_g,
      meals: sum.meals + day.meals_count,
      planDays: sum.planDays + (day.plan_meals_count > 0 ? 1 : 0),
      dietDays: sum.dietDays + (day.diet_logged ? 1 : 0),
      workoutDays: sum.workoutDays + (day.workout_logged ? 1 : 0),
      workouts: sum.workouts + day.workouts,
    }),
    { calories: 0, protein: 0, meals: 0, planDays: 0, dietDays: 0, workoutDays: 0, workouts: 0 }
  );
  const daysInRange = eachIsoDate(window.from, window.to).length;

  return {
    range,
    from: window.from,
    to: window.to,
    bucket: window.bucket,
    summary: {
      streak_days: 0,
      avg_adherence_pct: daysInRange ? Math.round((totals.dietDays / daysInRange) * 100) : 0,
      total_workouts_completed: totals.workouts,
      meals_logged: totals.meals,
      diet_days: totals.dietDays,
      plan_days: totals.planDays,
      workout_days: totals.workoutDays,
      days_in_range: daysInRange,
      total_calories: totals.calories,
      total_protein_g: totals.protein,
    },
    points,
  };
}
