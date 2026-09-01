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

const PENDING_KEY = "fyte.pending-workout-generation";

export type PendingWorkoutGeneration = {
  formData: WorkoutPlanFormData;
  error?: string;
};

let pendingGeneration: PendingWorkoutGeneration | null = null;

function readPendingStorage(): PendingWorkoutGeneration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingWorkoutGeneration;
    if (!parsed?.formData) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePendingStorage(value: PendingWorkoutGeneration | null) {
  if (typeof window === "undefined") return;
  try {
    if (!value) sessionStorage.removeItem(PENDING_KEY);
    else sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function setPendingWorkoutGeneration(formData: WorkoutPlanFormData) {
  pendingGeneration = { formData };
  writePendingStorage(pendingGeneration);
}

export function setPendingWorkoutError(message: string) {
  const current = readPendingWorkoutGeneration();
  if (!current) return;
  pendingGeneration = { ...current, error: message };
  writePendingStorage(pendingGeneration);
}

export function clearPendingWorkoutGeneration() {
  pendingGeneration = null;
  writePendingStorage(null);
}

export function readPendingWorkoutGeneration(): PendingWorkoutGeneration | null {
  if (pendingGeneration?.formData) return pendingGeneration;
  pendingGeneration = readPendingStorage();
  return pendingGeneration;
}
