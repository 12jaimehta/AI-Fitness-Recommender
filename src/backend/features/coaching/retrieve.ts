import { requireUser } from "@backend/shared/api/supabase";
import { parseLeadingNumber } from "@/shared/lib/plan-tracking";
import { coerceProgramGoal } from "@/shared/lib/program-goals";
import { utcToday } from "@backend/features/progress/db";
import { workoutTrained } from "@/shared/lib/daily-track";
import type { DietPlanData, WorkoutPlanData } from "@/shared/types";
import type { ExerciseLogEntry } from "@/shared/types/progress-tracking";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import { detectPlateaus, type WeightPoint } from "./plateau";
import { emptyFacts, parseMemory, type CoachingFacts, type CoachingMemoryRow } from "./memory";

export type CoachingContext = {
  today: string;
  fingerprint: string;
  memory: CoachingMemoryRow;
  facts: CoachingFacts;
  flags: ReturnType<typeof detectPlateaus>["flags"];
  reasons: string[];
  diet: {
    id: string | null;
    title: string;
    ageDays: number | null;
    goal: string | null;
    preference: string | null;
    calorieTarget: number | null;
    proteinTarget: number | null;
    meals: { slot: string; name: string; calories: string | number }[];
  } | null;
  workout: {
    id: string | null;
    title: string;
    ageDays: number | null;
    goal: string | null;
    frequency: number;
    duration: string | null;
    equipment: string | null;
  } | null;
  weights: WeightPoint[];
  sessionsLast42Days: number;
  calorieAdherencePct: number | null;
  proteinAdherencePct: number | null;
  previousAdvice: { at: string; headline: string }[];
};

function daysBetween(from: string, to: string) {
  return Math.max(0, Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000));
}

function datePart(value: string) {
  return String(value).slice(0, 10);
}

function mealSlots(plan: {
  meals?: Record<string, { name?: string; calories?: string | number } | undefined>;
}) {
  const meals = plan.meals || {};
  return Object.entries(meals)
    .filter(([, meal]) => meal?.name)
    .map(([slot, meal]) => ({
      slot,
      name: meal!.name || "",
      calories: meal!.calories || "",
    }));
}

export async function retrieveCoachingContext(): Promise<CoachingContext> {
  const { supabase, user } = await requireUser();
  const today = utcToday();
  const from42 = new Date(`${today}T00:00:00Z`);
  from42.setUTCDate(from42.getUTCDate() - 42);
  const from42Iso = from42.toISOString().slice(0, 10);
  const from90 = new Date(`${today}T00:00:00Z`);
  from90.setUTCDate(from90.getUTCDate() - 90);
  const from90Iso = from90.toISOString().slice(0, 10);

  const [profileRes, memoryRes, dietRowRes, workoutRowRes, vitalsRes, weightRes, mealsRes, workoutsRes, adviceRes] =
    await Promise.all([
      supabase.from("user_profiles").select("initial_weight, goals").eq("id", user.id).maybeSingle(),
      supabase.from("user_coaching_memory").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("diet_plans")
        .select("id, title, created_at, form_data, diet_plan")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workout_plans")
        .select("id, title, created_at, form_data, workout_plan")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("daily_progress_logs")
        .select("date, weight_kg")
        .eq("user_id", user.id)
        .not("weight_kg", "is", null)
        .gte("date", from90Iso)
        .order("date", { ascending: true }),
      supabase
        .from("weight_entries")
        .select("date, weight")
        .eq("user_id", user.id)
        .gte("date", from90Iso)
        .order("date", { ascending: true }),
      supabase
        .from("meal_logs")
        .select("date, total_calories, total_protein_g")
        .eq("user_id", user.id)
        .gte("date", from42Iso)
        .lte("date", today),
      supabase
        .from("workout_logs")
        .select("date, is_completed, exercises_completed")
        .eq("user_id", user.id)
        .gte("date", from42Iso)
        .lte("date", today),
      supabase
        .from("user_coaching_advice")
        .select("created_at, advice")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  const profile = profileRes.data;
  const memory = parseMemory(memoryRes.data);
  const byDate = new Map<string, number>();
  for (const row of weightRes.data || []) {
    const kg = Number(row.weight);
    if (Number.isFinite(kg) && kg > 0) byDate.set(datePart(String(row.date)), kg);
  }
  for (const row of vitalsRes.data || []) {
    const kg = Number(row.weight_kg);
    if (Number.isFinite(kg) && kg > 0) byDate.set(datePart(String(row.date)), kg);
  }
  const weights: WeightPoint[] = [...byDate.entries()]
    .map(([date, kg]) => ({ date, kg }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dietRow = dietRowRes.data as {
    id: string;
    title: string;
    created_at: string;
    form_data: DietPlanFormData;
    diet_plan: DietPlanData;
  } | null;
  const workoutRow = workoutRowRes.data as {
    id: string;
    title: string;
    created_at: string;
    form_data: WorkoutPlanFormData;
    workout_plan: WorkoutPlanData;
  } | null;

  const dietAgeDays = dietRow?.created_at ? daysBetween(datePart(dietRow.created_at), today) : null;
  const workoutAgeDays = workoutRow?.created_at ? daysBetween(datePart(workoutRow.created_at), today) : null;
  const frequency = parseLeadingNumber(workoutRow?.form_data.workoutFrequency, 4);
  const trainedDates = new Set<string>();
  for (const row of workoutsRes.data || []) {
    const trained = workoutTrained({
      is_completed: Boolean(row.is_completed),
      exercises_completed: Array.isArray(row.exercises_completed)
        ? (row.exercises_completed as ExerciseLogEntry[])
        : [],
      duration_minutes: 0,
      calories_burned_estimated: null,
    });
    if (trained) trainedDates.add(datePart(String(row.date)));
  }
  const sessionsLast42Days = trainedDates.size;
  const calorieTarget = dietRow ? parseLeadingNumber(dietRow.diet_plan.calorieTarget) : null;
  const proteinTarget = dietRow ? parseLeadingNumber(dietRow.diet_plan.proteinTarget) : null;

  const mealDays = new Map<string, { cal: number; protein: number }>();
  for (const row of mealsRes.data || []) {
    const key = datePart(String(row.date));
    const currentDay = mealDays.get(key) || { cal: 0, protein: 0 };
    currentDay.cal += Number(row.total_calories || 0);
    currentDay.protein += Number(row.total_protein_g || 0);
    mealDays.set(key, currentDay);
  }
  const mealDayList = [...mealDays.values()];
  const calorieAdherencePct =
    calorieTarget && mealDayList.length
      ? Math.round(
          (mealDayList.reduce((sum, row) => sum + row.cal, 0) / mealDayList.length / calorieTarget) * 100
        )
      : null;
  const proteinAdherencePct =
    proteinTarget && mealDayList.length
      ? Math.round(
          (mealDayList.reduce((sum, row) => sum + row.protein, 0) / mealDayList.length / proteinTarget) * 100
        )
      : null;

  const startWeight =
    memory.facts.start_weight_kg ||
    (profile?.initial_weight ? Number(profile.initial_weight) : null) ||
    weights[0]?.kg ||
    null;
  const lastWeight = weights[weights.length - 1] || null;
  const lowest = weights.reduce((min, row) => (row.kg < min ? row.kg : min), lastWeight?.kg || startWeight || Infinity);

  const goal = coerceProgramGoal(
    dietRow?.form_data.goal || workoutRow?.form_data.goal || (profile?.goals as string[] | null)?.[0]
  );
  const plateau = detectPlateaus({
    startWeightKg: startWeight,
    weights,
    dietAgeDays,
    workoutAgeDays,
    workoutSessionsLast42Days: sessionsLast42Days,
    workoutFrequency: frequency,
    goal: goal || null,
  });

  const facts: CoachingFacts = {
    ...emptyFacts(),
    ...memory.facts,
    start_weight_kg: startWeight,
    last_weight_kg: lastWeight?.kg || null,
    last_weight_date: lastWeight?.date || null,
    lowest_weight_kg: Number.isFinite(lowest) && lowest !== Infinity ? lowest : startWeight,
    diet_plan_id: dietRow?.id || null,
    diet_plan_started_at: dietRow?.created_at ? datePart(dietRow.created_at) : null,
    diet_goal: goal || dietRow?.form_data.goal || null,
    dietary_preference: dietRow?.form_data.dietaryPreference || null,
    calorie_target: calorieTarget,
    workout_plan_id: workoutRow?.id || null,
    workout_plan_started_at: workoutRow?.created_at ? datePart(workoutRow.created_at) : null,
    workout_weeks: workoutAgeDays != null ? Math.round(workoutAgeDays / 7) : null,
    typical_calorie_adherence_pct: calorieAdherencePct,
    typical_protein_adherence_pct: proteinAdherencePct,
    last_plateau_flags: plateau.flags,
  };

  const fingerprint = [
    facts.diet_plan_id || "none",
    facts.workout_plan_id || "none",
    plateau.flags.slice().sort().join(","),
    lastWeight?.kg ?? "nowt",
    lastWeight?.date || "nowt",
  ].join("|");

  const previousAdvice = (adviceRes.data || [])
    .map((row) => ({
      at: String(row.created_at),
      headline: String((row.advice as { headline?: string } | null)?.headline || ""),
    }))
    .filter((row) => row.headline);

  return {
    today,
    fingerprint,
    memory,
    facts,
    flags: plateau.flags,
    reasons: plateau.reasons,
    diet: dietRow
      ? {
          id: dietRow.id,
          title: dietRow.title || "Diet plan",
          ageDays: dietAgeDays,
          goal: goal || dietRow.form_data.goal || null,
          preference: dietRow.form_data.dietaryPreference || null,
          calorieTarget,
          proteinTarget,
          meals: mealSlots(dietRow.diet_plan),
        }
      : null,
    workout: workoutRow
      ? {
          id: workoutRow.id,
          title: workoutRow.title || "Workout plan",
          ageDays: workoutAgeDays,
          goal: coerceProgramGoal(workoutRow.form_data.goal) || goal || null,
          frequency,
          duration: workoutRow.form_data.workoutDuration || null,
          equipment: workoutRow.form_data.availableEquipment || null,
        }
      : null,
    weights,
    sessionsLast42Days,
    calorieAdherencePct,
    proteinAdherencePct,
    previousAdvice,
  };
}
