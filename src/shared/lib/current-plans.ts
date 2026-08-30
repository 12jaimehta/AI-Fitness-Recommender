import type { DailyMeals, DietPlanData, Exercise, MealData, WorkoutPlanData } from "@/shared/types";
import type {
  CurrentDietPlan,
  CurrentPlanExercise,
  CurrentPlanMeal,
  CurrentTodayWorkout,
  CurrentWorkoutPlan,
  PlannedFoodItem,
} from "@/shared/types/progress-tracking";
import {
  buildDietTrackMeals,
  dailyMealsForDate,
  mealsPerDayFromForm,
  parseDurationMinutes,
  parseLeadingNumber,
  weekdayFromIsoDate,
} from "@/shared/lib/plan-tracking";

const MEAL_TIMES: Record<string, string> = {
  breakfast: "08:00",
  morningSnack: "10:30",
  lunch: "13:00",
  afternoonSnack: "16:00",
  snacks: "16:00",
  eveningSnack: "17:30",
  dinner: "20:00",
  beforeBed: "21:30",
};

function portionFromMeal(meal: MealData) {
  if (typeof meal.ingredientBreakdown === "string") {
    const line = meal.ingredientBreakdown.split("\n").find((row) => row.trim()) || "";
    return line.replace(/^ingredients breakdown:?/i, "").trim().slice(0, 80) || "1 serving";
  }
  return "1 serving";
}

function foodItem(meal: MealData): PlannedFoodItem {
  return {
    name: meal.name,
    portion: portionFromMeal(meal),
    calories: parseLeadingNumber(meal.calories),
    protein_g: parseLeadingNumber(meal.protein),
    carbs_g: parseLeadingNumber(meal.carbs),
    fat_g: parseLeadingNumber(meal.fat),
  };
}

export function mapDietPlan(
  row: { id: string; title: string; form_data?: { mealsPerDay?: string | number }; diet_plan: DietPlanData },
  date: string
): CurrentDietPlan {
  const mealsPerDay = mealsPerDayFromForm(row.form_data);
  const dayMeals: DailyMeals = dailyMealsForDate(row.diet_plan, date);
  const slots = buildDietTrackMeals(dayMeals, mealsPerDay, {});

  const meals: CurrentPlanMeal[] = slots.map((slot) => {
    const raw = (dayMeals as Record<string, MealData | undefined>)[slot.slot];
    const item = raw ? foodItem(raw) : {
      name: slot.name || slot.label,
      portion: "1 serving",
      calories: slot.calories,
      protein_g: slot.protein,
      carbs_g: slot.carbs,
      fat_g: slot.fats,
    };
    return {
      meal_id: slot.slot,
      meal_name: slot.label,
      slot: slot.slot,
      recommended_time: MEAL_TIMES[slot.slot] || "12:00",
      items: [item],
      total_meal_calories: item.calories,
      total_meal_protein: item.protein_g,
    };
  });

  return {
    id: row.id,
    plan_name: row.title,
    target_calories: parseLeadingNumber(row.diet_plan.calorieTarget),
    target_protein_g: parseLeadingNumber(row.diet_plan.proteinTarget),
    target_carbs_g: parseLeadingNumber(row.diet_plan.carbTarget),
    target_fat_g: parseLeadingNumber(row.diet_plan.fatTarget),
    target_water_ml: 3000,
    meals,
  };
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "exercise";
}

function mapExercise(planId: string, dayKey: string, exercise: Exercise, index: number): CurrentPlanExercise {
  return {
    exercise_id: `${planId}:${dayKey}:${index}:${slug(exercise.name)}`,
    name: exercise.name,
    target_sets: Math.max(1, parseLeadingNumber(exercise.sets, 3)),
    target_reps: String(exercise.reps || "8-12"),
    rest_seconds: parseDurationMinutes(exercise.rest, 90),
    muscle_group: exercise.muscleGroup || "",
    suggested_weight: exercise.weight || "",
  };
}

export function mapWorkoutPlan(
  row: {
    id: string;
    title: string;
    form_data?: { workoutFrequency?: string | number; workoutDuration?: string | number };
    workout_plan: WorkoutPlanData;
  },
  date: string
): CurrentWorkoutPlan {
  const dayKey = weekdayFromIsoDate(date);
  const plan = row.workout_plan;
  const weekly = plan.weeklyPlan?.[dayKey];
  const today = weekly || plan.singleWorkout;
  const restListed = (plan.recommendedRestDays || []).some(
    (day) => String(day).toLowerCase().startsWith(dayKey.slice(0, 3))
  );
  const isRest =
    restListed ||
    !today ||
    !today.exercises?.length ||
    String(today.day || "").toLowerCase().includes("rest");

  const durationFallback = parseDurationMinutes(row.form_data?.workoutDuration, 45);
  const todayWorkout: CurrentTodayWorkout = {
    workout_id: `${row.id}:${isRest ? "rest" : weekly ? dayKey : "session"}`,
    day_of_week: dayKey,
    focus_area: isRest ? "Rest" : today?.muscleGroups?.join(" & ") || today?.day || "Workout",
    is_rest_day: isRest,
    estimated_duration_min: isRest ? 0 : parseDurationMinutes(today?.duration, durationFallback),
    estimated_calories: isRest ? 0 : parseLeadingNumber(today?.estimatedCalories, parseLeadingNumber(plan.estimatedCaloriesBurn)),
    exercises: isRest
      ? []
      : (today?.exercises || []).map((exercise, index) =>
          mapExercise(row.id, weekly ? dayKey : "session", exercise, index)
        ),
  };

  return {
    id: row.id,
    split_name: row.title,
    weekly_frequency: parseLeadingNumber(row.form_data?.workoutFrequency, 4),
    today_workout: todayWorkout,
  };
}

export function emptySetsForExercise(exercise: CurrentPlanExercise) {
  return Array.from({ length: exercise.target_sets }, (_, i) => ({
    id: `working-${exercise.exercise_id}-${i}`,
    kind: "working" as const,
    weight_kg: parseLeadingNumber(exercise.suggested_weight),
    reps: parseLeadingNumber(exercise.target_reps, 0),
  }));
}

export function workingSetStats(sets: { kind: string; weight_kg: number; reps: number }[]) {
  const working = sets.filter((set) => set.kind !== "warmup" && set.reps > 0);
  const totalReps = working.reduce((sum, set) => sum + set.reps, 0);
  const volume = working.reduce((sum, set) => sum + set.weight_kg * set.reps, 0);
  return {
    volume,
    totalReps,
    avgWeight: totalReps ? volume / totalReps : 0,
  };
}

export function formatVolume(kg: number) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t`;
  return `${Math.round(kg)} kg`;
}
