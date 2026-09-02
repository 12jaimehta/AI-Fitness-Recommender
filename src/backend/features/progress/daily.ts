import type { DailyProgress, DailyVitals } from "@/shared/types/progress-tracking";
import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { parseIsoDate } from "@/shared/lib/plan-tracking";
import { summarizeTrackDay, workoutTrained } from "@/shared/lib/daily-track";
import { getCurrentPlans } from "./current-plans";
import { listMealLogs } from "./meals";
import { getWorkoutLog } from "./workouts-log";
import { throwIfSchemaMissing, utcToday } from "./db";
import { dropCoachingCache } from "@backend/shared/lib/redis";

export async function getVitals(date: string, auth?: AuthCtx): Promise<DailyVitals> {
  const { supabase, user } = await resolveAuth(auth);
  const { data, error } = await supabase
    .from("daily_progress_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return {
    weight_kg: data?.weight_kg == null ? null : Number(data.weight_kg),
    water_intake_ml: Number(data?.water_intake_ml || 0),
    sleep_hours: data?.sleep_hours == null ? null : Number(data.sleep_hours),
    energy_rating: data?.energy_rating == null ? null : Number(data.energy_rating),
    mood_rating: data?.mood_rating == null ? null : Number(data.mood_rating),
  };
}

export async function upsertVitals(input: {
  date?: string;
  weight_kg?: number | null;
  water_increment_ml?: number;
  water_intake_ml?: number;
  sleep_hours?: number | null;
  energy_rating?: number | null;
  mood_rating?: number | null;
}) {
  const resolved = await resolveAuth();
  const { supabase, user } = resolved;
  const date = parseIsoDate(input.date, utcToday());
  const current = await getVitals(date, resolved);
  const water =
    input.water_intake_ml != null
      ? Number(input.water_intake_ml)
      : Math.max(0, current.water_intake_ml + Number(input.water_increment_ml || 0));

  const row = {
    user_id: user.id,
    date,
    weight_kg: input.weight_kg ?? current.weight_kg,
    water_intake_ml: water,
    sleep_hours: input.sleep_hours ?? current.sleep_hours,
    energy_rating: input.energy_rating ?? current.energy_rating,
    mood_rating: input.mood_rating ?? current.mood_rating,
  };

  const { data, error } = await supabase
    .from("daily_progress_logs")
    .upsert(row, { onConflict: "user_id,date" })
    .select()
    .single();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  if (input.weight_kg != null) await dropCoachingCache(user.id);
  return data;
}

export async function getDailyProgress(dateInput?: string | null, auth?: AuthCtx): Promise<DailyProgress> {
  const resolved = await resolveAuth(auth);
  const date = parseIsoDate(dateInput, utcToday());
  const [plans, meals, workout, vitals] = await Promise.all([
    getCurrentPlans(date, resolved),
    listMealLogs(date, resolved),
    getWorkoutLog(date, resolved),
    getVitals(date, resolved),
  ]);

  const totals = summarizeTrackDay(meals, workout);
  const mealSlots = plans.diet_plan?.meals.length || 0;
  const checked = mealSlots ? totals.plan_meals_count / mealSlots : 0;
  const calorieRatio = plans.diet_plan?.target_calories
    ? Math.min(totals.calories / plans.diet_plan.target_calories, 1)
    : 0;
  const workoutScore = plans.workout_plan?.today_workout.is_rest_day || totals.workout_logged ? 1 : 0;
  const adherence = Math.round(((checked + calorieRatio + workoutScore) / 3) * 100);

  return {
    date,
    diet_plan: plans.diet_plan,
    workout_plan: plans.workout_plan,
    targets: {
      calories: plans.diet_plan?.target_calories || 0,
      protein_g: plans.diet_plan?.target_protein_g || 0,
      water_ml: plans.diet_plan?.target_water_ml || 3000,
      is_workout_day: Boolean(plans.workout_plan && !plans.workout_plan.today_workout.is_rest_day),
      workout_focus: plans.workout_plan?.today_workout.focus_area || "",
    },
    actuals: {
      total_calories: totals.calories,
      total_protein_g: totals.protein_g,
      total_carbs_g: meals.reduce((sum, meal) => sum + Number(meal.total_carbs_g || 0), 0),
      total_fat_g: meals.reduce((sum, meal) => sum + Number(meal.total_fat_g || 0), 0),
      water_intake_ml: vitals.water_intake_ml,
      weight_kg: vitals.weight_kg,
      sleep_hours: vitals.sleep_hours,
      energy_rating: vitals.energy_rating,
      workout_completed: workoutTrained(workout),
      meals_logged: meals,
      workout_log: workout,
    },
    adherence_score_pct: adherence,
  };
}
