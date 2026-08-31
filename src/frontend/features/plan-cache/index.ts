import { api } from "@frontend/shared/api/http";
import {
  applyGeneratedDietPlan,
  clearGeneratedDietPlan,
  readGeneratedDietPlan,
  type GeneratedDietSession,
} from "@frontend/features/diet-plan/generated-session";
import {
  applyGeneratedWorkoutPlan,
  clearGeneratedWorkoutPlan,
  readGeneratedWorkoutPlan,
  type GeneratedWorkoutSession,
} from "@frontend/features/workout-plan/generated-session";
import { dropServerPlanCache, persistPlanCache, purgeLegacyPlanStorage } from "./storage";

export { purgeLegacyPlanStorage };

let hydrateInFlight: Promise<void> | null = null;

export function clearClientPlanCache() {
  clearGeneratedDietPlan();
  clearGeneratedWorkoutPlan();
  purgeLegacyPlanStorage();
}

export async function persistClientPlans() {
  const diet = readGeneratedDietPlan();
  const workout = readGeneratedWorkoutPlan();
  if (!diet && !workout) return;
  await persistPlanCache({ diet, workout });
}

export async function hydratePlanCache() {
  if (hydrateInFlight) return hydrateInFlight;

  hydrateInFlight = (async () => {
    purgeLegacyPlanStorage();
    try {
      const result = await api<{
        diet: GeneratedDietSession | null;
        workout: GeneratedWorkoutSession | null;
      }>("/api/cache");
      if (result.diet && !readGeneratedDietPlan()) applyGeneratedDietPlan(result.diet);
      if (result.workout && !readGeneratedWorkoutPlan()) applyGeneratedWorkoutPlan(result.workout);
    } catch {
      /* guest or request failed — keep in-memory plans */
    }
  })().finally(() => {
    hydrateInFlight = null;
  });

  return hydrateInFlight;
}

export async function dropUserPlanCache() {
  await dropServerPlanCache();
  clearClientPlanCache();
}
