import { requireUser } from "@backend/shared/api/supabase";
import { getCurrentDiet, getCurrentWorkout } from "@backend/features/plan-cache";
import { parseLeadingNumber } from "@/shared/lib/plan-tracking";
import { coerceProgramGoal } from "@/shared/lib/program-goals";
import { utcToday } from "@backend/features/progress/db";
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

  const [diet, workout, profileRes, memoryRes, dietRowRes, workoutRowRes, vitalsRes, weightRes, mealsRes, workoutsRes, adviceRes] =
    await Promise.all([
      getCurrentDiet(user.id),
      getCurrentWorkout(user.id),
      supabase.from("user_profiles").select("initial_weight, goals").eq("id", user.id).maybeSingle(),
      supabase.from("user_coaching_memory").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("diet_plans")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("workout_plans")
        .select("id, title, created_at")
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
        .select("date, is_completed")
        .eq("user_id", user.id)
        .eq("is_completed", true)
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

  const dietAgeDays = dietRowRes.data?.created_at
    ? daysBetween(datePart(dietRowRes.data.created_at), today)
    : null;
  const workoutAgeDays = workoutRowRes.data?.created_at
    ? daysBetween(datePart(workoutRowRes.data.created_at), today)
    : null;
  const frequency = parseLeadingNumber(workout?.formData.workoutFrequency, 4);
  const sessionsLast42Days = (workoutsRes.data || []).length;
  const calorieTarget = diet ? parseLeadingNumber(diet.plan.calorieTarget) : null;
  const proteinTarget = diet ? parseLeadingNumber(diet.plan.proteinTarget) : null;

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

  const goal = coerceProgramGoal(diet?.formData.goal || workout?.formData.goal || profile?.goals?.[0]);
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
    diet_plan_id: diet?.id || dietRowRes.data?.id || null,
    diet_plan_started_at: dietRowRes.data?.created_at ? datePart(dietRowRes.data.created_at) : null,
    diet_goal: goal || diet?.formData.goal || null,
    dietary_preference: diet?.formData.dietaryPreference || null,
    calorie_target: calorieTarget,
    workout_plan_id: workout?.id || workoutRowRes.data?.id || null,
    workout_plan_started_at: workoutRowRes.data?.created_at ? datePart(workoutRowRes.data.created_at) : null,
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
    diet: diet
      ? {
          id: diet.id || dietRowRes.data?.id || null,
          title: diet.title || dietRowRes.data?.title || "Diet plan",
          ageDays: dietAgeDays,
          goal: goal || diet.formData.goal || null,
          preference: diet.formData.dietaryPreference || null,
          calorieTarget,
          proteinTarget,
          meals: mealSlots(diet.plan),
        }
      : null,
    workout: workout
      ? {
          id: workout.id || workoutRowRes.data?.id || null,
          title: workout.title || workoutRowRes.data?.title || "Workout plan",
          ageDays: workoutAgeDays,
          goal: coerceProgramGoal(workout.formData.goal) || goal || null,
          frequency,
          duration: workout.formData.workoutDuration || null,
          equipment: workout.formData.availableEquipment || null,
        }
      : null,
    weights,
    sessionsLast42Days,
    calorieAdherencePct,
    proteinAdherencePct,
    previousAdvice,
  };
}
