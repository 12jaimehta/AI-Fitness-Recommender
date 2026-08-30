import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";

const STORAGE_KEY = "fyte.generated-workout-plan";

export type GeneratedWorkoutSession = {
  formData: WorkoutPlanFormData;
  plan: WorkoutPlanData;
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

function writeStorage(storage: Storage, session: GeneratedWorkoutSession) {
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readStorage(storage: Storage): GeneratedWorkoutSession | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeneratedWorkoutSession;
    if (!hasPlanContent(parsed?.plan)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeGeneratedWorkoutPlan(session: GeneratedWorkoutSession) {
  memoryPlan = session;
  try {
    writeStorage(sessionStorage, session);
  } catch {
    /* quota or private mode */
  }
  try {
    writeStorage(localStorage, session);
  } catch {
    /* quota or private mode */
  }
}

export function readGeneratedWorkoutPlan(): GeneratedWorkoutSession | null {
  if (hasPlanContent(memoryPlan?.plan)) return memoryPlan;
  if (typeof window === "undefined") return null;
  return readStorage(sessionStorage) || readStorage(localStorage);
}
