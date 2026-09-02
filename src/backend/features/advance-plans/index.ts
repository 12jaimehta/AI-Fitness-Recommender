import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { getCurrentDiet, getCurrentWorkout, setCurrentDiet, setCurrentWorkout } from "@backend/features/plan-cache";
import { generateDietPlan } from "@backend/features/generate-diet";
import { generateWorkoutPlan } from "@backend/features/generate-workout";
import { createDietPlan } from "@backend/features/diet-plans";
import { createWorkoutPlan } from "@backend/features/workout-plans";
import { applyCalorieOverride, calculateNutritionTargets } from "@backend/ai/nutrition";
import { parseLeadingNumber } from "@/shared/lib/plan-tracking";
import { detectCalorieStall, type CalorieStallResult } from "@/shared/lib/calorie-stall";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { DietPlanData, WorkoutPlanData } from "@/shared/types";
import { formatWeekNotes, loadWeekLogs } from "./week-logs";

export type AdvanceDietResult = {
  formData: DietPlanFormData;
  plan: DietPlanData;
  stall: CalorieStallResult;
};

export type AdvanceWorkoutResult = {
  formData: WorkoutPlanFormData;
  plan: WorkoutPlanData;
};

function withCurrentWeight(formData: DietPlanFormData, kg: number | undefined): DietPlanFormData {
  if (!kg || !Number.isFinite(kg) || kg <= 0) return formData;
  if (formData.weightUnit === "lbs") {
    return { ...formData, weight: String(Math.round((kg / 0.453592) * 10) / 10) };
  }
  return { ...formData, weight: String(Math.round(kg * 10) / 10), weightUnit: "kg" };
}

export async function advanceDietFromLogs(): Promise<AdvanceDietResult> {
  const auth = await requireUser();
  const current = await getCurrentDiet(auth.user.id, auth);
  if (!current?.formData || !current.plan) {
    throw new ApiError("Save a diet plan first. Next week is built from that plan plus your logs.", 400);
  }

  const week = await loadWeekLogs(auth);
  const formData: DietPlanFormData = {
    ...withCurrentWeight(current.formData, week.weights.at(-1)?.kg),
    planType: "weekly",
  };
  const nutrition = calculateNutritionTargets(formData);
  const currentCalories = parseLeadingNumber(current.plan.calorieTarget, nutrition.calories);
  const stall = detectCalorieStall(week.weights, formData.goal, currentCalories);
  const nextCalories = stall.nextCalories ?? currentCalories;
  const targets = applyCalorieOverride(nutrition, nextCalories);
  const logNotes = formatWeekNotes(
    week,
    stall.stalled
      ? `STALL: ${stall.reason}`
      : `Keep about ${currentCalories} kcal unless the logs clearly over/under-eat.`
  );

  const generated = await generateDietPlan(formData, {
    calorieOverride: targets.calories,
    logNotes,
  });
  const plan = {
    ...generated,
    calorieTarget: String(targets.calories),
    proteinTarget: String(targets.protein),
    carbTarget: String(targets.carbs),
    fatTarget: String(targets.fat),
  };

  await setCurrentDiet(auth.user.id, { formData, plan, title: `Week of ${week.to}` });
  try {
    await createDietPlan({
      formData,
      dietPlan: plan,
      title: `Week of ${week.to}`,
    });
  } catch {
    /* history insert is optional; current plan is already cached */
  }

  return { formData, plan, stall };
}

export async function advanceWorkoutFromLogs(): Promise<AdvanceWorkoutResult> {
  const auth = await requireUser();
  const current = await getCurrentWorkout(auth.user.id, auth);
  if (!current?.formData || !current.plan) {
    throw new ApiError(
      "Save a workout plan first. Next week is built from that plan plus your sessions.",
      400
    );
  }

  const week = await loadWeekLogs(auth);
  const formData: WorkoutPlanFormData = { ...current.formData, planType: "weekly" };
  const plan = await generateWorkoutPlan(formData, { logNotes: formatWeekNotes(week) });

  await setCurrentWorkout(auth.user.id, { formData, plan, title: `Week of ${week.to}` });
  try {
    await createWorkoutPlan({
      formData,
      workoutPlan: plan,
      title: `Week of ${week.to}`,
    });
  } catch {
    /* history insert is optional; current plan is already cached */
  }

  return { formData, plan };
}
