import type { DailyProgress, DailyVitals } from "@/shared/types/progress-tracking";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { parseIsoDate } from "@/shared/lib/plan-tracking";
import { getCurrentPlans } from "./current-plans";
import { listMealLogs } from "./meals";
import { getWorkoutLog } from "./workouts-log";
import { throwIfSchemaMissing, utcToday } from "./db";
import { dropCoachingCache } from "@backend/shared/lib/redis";

export async function getVitals(date: string): Promise<DailyVitals> {
  const { supabase, user } = await requireUser();
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
  const { supabase, user } = await requireUser();
  const date = parseIsoDate(input.date, utcToday());
  const current = await getVitals(date);
  const water =
    input.water_intake_ml != null
      ? Number(input.water_intake_ml)
      : current.water_intake_ml + Number(input.water_increment_ml || 0);

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

export async function getDailyProgress(dateInput?: string | null): Promise<DailyProgress> {
  const date = parseIsoDate(dateInput, utcToday());
  const [plans, meals, workout, vitals] = await Promise.all([
    getCurrentPlans(date),
    listMealLogs(date),
    getWorkoutLog(date),
    getVitals(date),
  ]);

  const totals = meals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.total_calories,
      protein: sum.protein + Number(meal.total_protein_g),
      carbs: sum.carbs + Number(meal.total_carbs_g),
      fat: sum.fat + Number(meal.total_fat_g),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const targetCalories = plans.diet_plan?.target_calories || 0;
  const mealSlots = plans.diet_plan?.meals.length || 0;
  const checked = mealSlots
    ? meals.filter((meal) => meal.source_type === "plan_checkoff").length / mealSlots
    : 0;
  const calorieRatio = targetCalories ? Math.min(totals.calories / targetCalories, 1) : 0;
  const workoutScore = plans.workout_plan?.today_workout.is_rest_day
    ? 1
    : workout?.is_completed
      ? 1
      : 0;
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
      total_protein_g: totals.protein,
      total_carbs_g: totals.carbs,
      total_fat_g: totals.fat,
      water_intake_ml: vitals.water_intake_ml,
      weight_kg: vitals.weight_kg,
      sleep_hours: vitals.sleep_hours,
      energy_rating: vitals.energy_rating,
      workout_completed: Boolean(workout?.is_completed),
      meals_logged: meals,
      workout_log: workout,
    },
    adherence_score_pct: adherence,
  };
}
