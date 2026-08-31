import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import { persistPlanCache, purgeLegacyPlanStorage } from "@frontend/features/plan-cache/storage";

export type GeneratedWorkoutSession = {
  formData: WorkoutPlanFormData;
  plan: WorkoutPlanData;
  id?: string;
  title?: string;
};

let memoryPlan: GeneratedWorkoutSession | null = null;

function hasPlanContent(plan?: WorkoutPlanData | null) {
  if (!plan) return false;
  if (plan.singleWorkout?.exercises?.length) return true;
  if (!plan.weeklyPlan) return false;
  return Object.values(plan.weeklyPlan).some(
    (day) => Boolean(day) && (Boolean(day.exercises?.length) || Boolean(day.day))
  );
}

export function applyGeneratedWorkoutPlan(session: GeneratedWorkoutSession) {
  if (!hasPlanContent(session?.plan)) return;
  memoryPlan = session;
}

export function clearGeneratedWorkoutPlan() {
  memoryPlan = null;
}

export function storeGeneratedWorkoutPlan(session: GeneratedWorkoutSession) {
  applyGeneratedWorkoutPlan(session);
  purgeLegacyPlanStorage();
  void persistPlanCache({ workout: session });
}

export function readGeneratedWorkoutPlan(): GeneratedWorkoutSession | null {
  if (hasPlanContent(memoryPlan?.plan)) return memoryPlan;
  return null;
}
