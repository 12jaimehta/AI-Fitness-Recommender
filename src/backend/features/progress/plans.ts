import type { DietPlanData, TrackingContext, WorkoutEntry, WorkoutPlanData } from "@/shared/types";
import { requireUser, resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import {
  asLoggedMeals,
  buildDietTrackMeals,
  buildWorkoutTrackSessions,
  dailyMealsForDate,
  emptyDiet,
  emptyTracking,
  emptyWorkout,
  encodePlanNote,
  mealsPerDayFromForm,
  parseIsoDate,
  parseLeadingNumber,
  parsePlanNote,
  plannedMealForSlot,
  sumLoggedMeals,
  weekStartMonday,
  weekdayFromIsoDate,
} from "@/shared/lib/plan-tracking";

type DietPlanRow = {
  id: string;
  title: string;
  form_data: { mealsPerDay?: string | number };
  diet_plan: DietPlanData;
};

type WorkoutPlanRow = {
  id: string;
  title: string;
  form_data: { workoutFrequency?: string | number; workoutDuration?: string | number };
  workout_plan: WorkoutPlanData;
};

function todayIso() {
  return new Date().toISOString().split("T")[0];
}

export async function getLatestDietPlan(auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase
    .from("diet_plans")
    .select("id, title, form_data, diet_plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as DietPlanRow | null) || null;
}

export async function getLatestWorkoutPlan(auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase
    .from("workout_plans")
    .select("id, title, form_data, workout_plan")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as WorkoutPlanRow | null) || null;
}

export async function getTrackingContext(dateInput?: string | null, auth?: AuthCtx): Promise<TrackingContext> {
  const { supabase, user } = await resolveAuth(auth);
  const date = parseIsoDate(dateInput, todayIso());
  const todayKey = weekdayFromIsoDate(date);
  const weekFrom = weekStartMonday(date);

  const [dietRes, workoutRes, nutritionRes, weekWorkoutsRes] = await Promise.all([
    supabase
      .from("diet_plans")
      .select("id, title, form_data, diet_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workout_plans")
      .select("id, title, form_data, workout_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("daily_nutrition").select("*").eq("user_id", user.id).eq("date", date).maybeSingle(),
    supabase
      .from("workout_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", weekFrom)
      .lte("date", date)
      .order("date", { ascending: false }),
  ]);

  const tracking = emptyTracking(date);
  const dietPlan = (dietRes.data as DietPlanRow | null) || null;
  const workoutPlan = (workoutRes.data as WorkoutPlanRow | null) || null;
  const loggedMeals = asLoggedMeals(nutritionRes.data?.meals);
  const weekRows = (weekWorkoutsRes.data || []) as WorkoutEntry[];
  const todayRows = weekRows.filter((row) => String(row.date).slice(0, 10) === date);

  if (dietPlan?.diet_plan) {
    const mealsPerDay = mealsPerDayFromForm(dietPlan.form_data);
    const meals = buildDietTrackMeals(dailyMealsForDate(dietPlan.diet_plan, date), mealsPerDay, loggedMeals);
    const todayCalories = meals.filter((meal) => meal.logged).reduce((sum, meal) => sum + meal.calories, 0);
    tracking.diet = {
      hasPlan: true,
      planId: dietPlan.id,
      title: dietPlan.title,
      mealsPerDay,
      calorieTarget: parseLeadingNumber(dietPlan.diet_plan.calorieTarget),
      proteinTarget: parseLeadingNumber(dietPlan.diet_plan.proteinTarget),
      carbTarget: parseLeadingNumber(dietPlan.diet_plan.carbTarget),
      fatTarget: parseLeadingNumber(dietPlan.diet_plan.fatTarget),
      meals,
      loggedCount: meals.filter((meal) => meal.logged).length,
      todayCalories,
    };
  } else {
    tracking.diet = emptyDiet();
  }

  if (workoutPlan?.workout_plan) {
    const loggedDays = new Set(
      todayRows
        .map((row) => parsePlanNote(row.notes)?.day)
        .filter((day): day is string => Boolean(day))
    );
    const sessions = buildWorkoutTrackSessions(
      workoutPlan.workout_plan,
      workoutPlan.form_data,
      todayKey,
      loggedDays
    );
    const todaySession = sessions.find((session) => session.isToday);
    tracking.workout = {
      hasPlan: true,
      planId: workoutPlan.id,
      title: workoutPlan.title,
      frequency: parseLeadingNumber(workoutPlan.form_data?.workoutFrequency),
      todayKey,
      isRestDay: todaySession ? todaySession.isRest : false,
      sessions,
      loggedToday: [...loggedDays],
      sessionsThisWeek: weekRows.length,
      todayCalories: todayRows.reduce((sum, row) => sum + Number(row.calories_burned || 0), 0),
    };
  } else {
    tracking.workout = emptyWorkout(todayKey);
  }

  return tracking;
}

export async function logDietMeal(input: { slot?: string; date?: string; logged?: boolean }) {
  const slot = String(input.slot || "").trim();
  if (!slot) throw new ApiError("Choose a meal from your diet plan.", 400);

  const { supabase, user } = await requireUser();
  const date = parseIsoDate(input.date, todayIso());
  const plan = await getLatestDietPlan();
  if (!plan?.diet_plan) throw new ApiError("Save a diet plan first, then track those meals.", 400);

  const planned = plannedMealForSlot(dailyMealsForDate(plan.diet_plan, date), slot);
  if (!planned) throw new ApiError("That meal is not in today's plan.", 400);

  const { data: existing } = await supabase
    .from("daily_nutrition")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  const meals = asLoggedMeals(existing?.meals);
  const already = Boolean(meals[slot]);
  const shouldLog = typeof input.logged === "boolean" ? input.logged : !already;

  if (shouldLog) meals[slot] = planned;
  else delete meals[slot];

  const totals = sumLoggedMeals(meals);
  const row = {
    user_id: user.id,
    date,
    calories: totals.calories,
    protein: totals.protein,
    carbs: totals.carbs,
    fats: totals.fats,
    meals,
  };

  const { data, error } = await supabase
    .from("daily_nutrition")
    .upsert(row, { onConflict: "user_id,date" })
    .select()
    .single();
  if (error) {
    if (/meals|schema cache/i.test(error.message)) {
      throw new ApiError("Paste supabase/schema/03_personal_fitness.sql so daily_nutrition.meals exists.", 400);
    }
    throw new ApiError(error.message, 400);
  }
  return data;
}

export async function logPlanWorkout(input: { dayKey?: string; date?: string; logged?: boolean }) {
  const dayKey = String(input.dayKey || "").trim();
  if (!dayKey) throw new ApiError("Choose a workout from your plan.", 400);

  const { supabase, user } = await requireUser();
  const date = parseIsoDate(input.date, todayIso());
  const plan = await getLatestWorkoutPlan();
  if (!plan?.workout_plan) throw new ApiError("Save a workout plan first, then track those sessions.", 400);

  const todayKey = weekdayFromIsoDate(date);
  const sessions = buildWorkoutTrackSessions(plan.workout_plan, plan.form_data, todayKey, new Set());
  const session = sessions.find((item) => item.dayKey === dayKey);
  if (!session) throw new ApiError("That session is not in your current workout plan.", 400);
  if (session.isRest) throw new ApiError("That day is a rest day on your plan.", 400);

  const { data: todayRows } = await supabase
    .from("workout_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date);

  const rows = (todayRows || []) as WorkoutEntry[];
  const existing = rows.find((row) => parsePlanNote(row.notes)?.day === dayKey);
  const shouldLog = typeof input.logged === "boolean" ? input.logged : !existing;

  if (!shouldLog) {
    if (!existing) return existing;
    const { error } = await supabase
      .from("workout_entries")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", user.id);
    if (error) throw new ApiError(error.message, 400);
    return existing;
  }

  if (existing) return existing;

  const { data, error } = await supabase
    .from("workout_entries")
    .insert([
      {
        user_id: user.id,
        workout_type: session.label,
        duration_minutes: session.durationMinutes,
        calories_burned: session.estimatedCalories,
        date,
        notes: encodePlanNote(plan.id, session.dayKey),
      },
    ])
    .select()
    .single();

  if (error) throw new ApiError(error.message, 400);
  return data as WorkoutEntry;
}
