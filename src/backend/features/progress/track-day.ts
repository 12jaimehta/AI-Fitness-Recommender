import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { summarizeTrackDay, workingSetsDone, type TrackDaySummary } from "@/shared/lib/daily-track";
import type { ExerciseLogEntry, MealLogRow, MealSourceType, PlannedFoodItem, WorkoutLogRow } from "@/shared/types/progress-tracking";
import { civilDate, throwIfSchemaMissing } from "./db";

function asMeals(rows: Record<string, unknown>[]): MealLogRow[] {
  return rows.map((row) => ({
    id: String(row.id || ""),
    date: civilDate(row.date),
    meal_slot: String(row.meal_slot || ""),
    source_type: row.source_type as MealSourceType,
    meal_name: String(row.meal_name || ""),
    items: Array.isArray(row.items) ? (row.items as PlannedFoodItem[]) : [],
    total_calories: Number(row.total_calories || 0),
    total_protein_g: Number(row.total_protein_g || 0),
    total_carbs_g: Number(row.total_carbs_g || 0),
    total_fat_g: Number(row.total_fat_g || 0),
    is_plan_compliant: Boolean(row.is_plan_compliant),
    ai_explanation: row.ai_explanation ? String(row.ai_explanation) : null,
  }));
}

function asWorkout(row: Record<string, unknown> | null): WorkoutLogRow | null {
  if (!row) return null;
  const exercises = Array.isArray(row.exercises_completed) ? (row.exercises_completed as ExerciseLogEntry[]) : [];
  return {
    id: String(row.id),
    date: civilDate(row.date),
    workout_plan_id: row.workout_plan_id ? String(row.workout_plan_id) : null,
    source_type: (row.source_type as WorkoutLogRow["source_type"]) || "manual",
    title: String(row.title || "Workout"),
    duration_minutes: Number(row.duration_minutes || 0),
    rpe_rating: row.rpe_rating == null ? null : Number(row.rpe_rating),
    calories_burned_estimated: row.calories_burned_estimated == null ? null : Number(row.calories_burned_estimated),
    exercises_completed: exercises,
    is_completed: Boolean(row.is_completed) || workingSetsDone(exercises) > 0,
    notes: row.notes ? String(row.notes) : null,
  };
}

export async function rebuildDailyTrackDay(date: string, auth?: AuthCtx): Promise<TrackDaySummary> {
  const { supabase, user } = await resolveAuth(auth);
  const [mealsRes, workoutRes] = await Promise.all([
    supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("date", date),
    supabase
      .from("workout_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const meals = asMeals((mealsRes.data || []) as Record<string, unknown>[]);
  const workout = asWorkout((workoutRes.data || null) as Record<string, unknown> | null);
  const summary = summarizeTrackDay(meals, workout);

  const { error } = await supabase.from("daily_track_days").upsert(
    {
      user_id: user.id,
      date,
      calories: summary.calories,
      protein_g: summary.protein_g,
      meals_count: summary.meals_count,
      plan_meals_count: summary.plan_meals_count,
      workout_logged: summary.workout_logged,
      workouts: summary.workouts,
      workout_kcal: summary.workout_kcal,
      workout_minutes: summary.workout_minutes,
      sets_completed: summary.sets_completed,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,date" }
  );

  if (error && !/does not exist|schema cache|could not find the table/i.test(error.message || "")) {
    throwIfSchemaMissing(error);
  }

  return summary;
}
