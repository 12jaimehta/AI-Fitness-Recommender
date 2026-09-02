import type { AuthCtx } from "@backend/shared/api/supabase";
import { utcToday } from "@backend/features/progress/db";
import { addDaysIso } from "@/shared/lib/plan-tracking";
import { workoutTrained } from "@/shared/lib/daily-track";
import type { ExerciseLogEntry } from "@/shared/types/progress-tracking";
import type { WeightPoint } from "@/shared/lib/calorie-stall";

export type WeekMealDay = {
  date: string;
  meals: number;
  calories: number;
  protein: number;
};

export type WeekSession = {
  date: string;
  title: string;
  trained: boolean;
  lifts: string[];
};

export type WeekLogs = {
  from: string;
  to: string;
  meals: WeekMealDay[];
  sessions: WeekSession[];
  weights: WeightPoint[];
};

function datePart(value: string) {
  return String(value).slice(0, 10);
}

export async function loadWeekLogs(auth: AuthCtx): Promise<WeekLogs> {
  const { supabase, user } = auth;
  const to = utcToday();
  const from = addDaysIso(to, -6);
  const fromWeights = addDaysIso(to, -21);

  const [mealsRes, workoutsRes, vitalsRes, weightRes] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("date, total_calories, total_protein_g")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("workout_logs")
      .select("date, is_completed, title, exercises_completed")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to),
    supabase
      .from("daily_progress_logs")
      .select("date, weight_kg")
      .eq("user_id", user.id)
      .not("weight_kg", "is", null)
      .gte("date", fromWeights)
      .lte("date", to),
    supabase
      .from("weight_entries")
      .select("date, weight")
      .eq("user_id", user.id)
      .gte("date", fromWeights)
      .lte("date", to),
  ]);

  const mealDays = new Map<string, WeekMealDay>();
  for (const row of mealsRes.data || []) {
    const date = datePart(String(row.date));
    const current = mealDays.get(date) || { date, meals: 0, calories: 0, protein: 0 };
    current.meals += 1;
    current.calories += Number(row.total_calories || 0);
    current.protein += Number(row.total_protein_g || 0);
    mealDays.set(date, current);
  }

  const sessions: WeekSession[] = (workoutsRes.data || []).map((row) => {
    const exercises = Array.isArray(row.exercises_completed)
      ? (row.exercises_completed as ExerciseLogEntry[])
      : [];
    const trained = workoutTrained({
      is_completed: Boolean(row.is_completed),
      exercises_completed: exercises,
      duration_minutes: 0,
      calories_burned_estimated: null,
    });
    const lifts = exercises
      .map((exercise) => {
        const working = (exercise.sets || []).filter((set) => set.kind !== "warmup" && set.reps);
        const top = working[working.length - 1];
        if (!top) return exercise.exercise_name;
        return `${exercise.exercise_name} ${top.weight_kg || 0}kg x${top.reps}`;
      })
      .slice(0, 8);
    return {
      date: datePart(String(row.date)),
      title: String(row.title || "Workout"),
      trained,
      lifts,
    };
  });

  const byDate = new Map<string, number>();
  for (const row of weightRes.data || []) {
    const kg = Number(row.weight);
    if (Number.isFinite(kg) && kg > 0) byDate.set(datePart(String(row.date)), kg);
  }
  for (const row of vitalsRes.data || []) {
    const kg = Number(row.weight_kg);
    if (Number.isFinite(kg) && kg > 0) byDate.set(datePart(String(row.date)), kg);
  }

  return {
    from,
    to,
    meals: [...mealDays.values()].sort((a, b) => a.date.localeCompare(b.date)),
    sessions: sessions.sort((a, b) => a.date.localeCompare(b.date)),
    weights: [...byDate.entries()]
      .map(([date, kg]) => ({ date, kg }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export function formatWeekNotes(week: WeekLogs, extra?: string) {
  const mealLines = week.meals.length
    ? week.meals
        .map(
          (day) =>
            `- ${day.date}: ${day.meals} meals, ${Math.round(day.calories)} kcal, ${Math.round(day.protein)}g protein`
        )
        .join("\n")
    : "- No meals logged this week.";
  const sessionLines = week.sessions.length
    ? week.sessions
        .map(
          (session) =>
            `- ${session.date}: ${session.title}${session.trained ? "" : " (incomplete)"}${
              session.lifts.length ? ` — ${session.lifts.join("; ")}` : ""
            }`
        )
        .join("\n")
    : "- No workouts logged this week.";
  const weightLines = week.weights.length
    ? week.weights.map((row) => `- ${row.date}: ${row.kg.toFixed(1)} kg`).join("\n")
    : "- No weight logs in the last 21 days.";

  return `Window: ${week.from} to ${week.to}
Meals:
${mealLines}
Sessions:
${sessionLines}
Weight:
${weightLines}${extra ? `\n${extra}` : ""}`;
}
