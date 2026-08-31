import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";
import { persistPlanCache, purgeLegacyPlanStorage } from "@frontend/features/plan-cache/storage";

export type GeneratedDietSession = {
  formData: DietPlanFormData;
  plan: DietPlanData;
  id?: string;
  title?: string;
};

let memoryPlan: GeneratedDietSession | null = null;

function hasPlanContent(plan?: DietPlanData | null) {
  if (!plan) return false;
  const meals = plan.meals ? Object.values(plan.meals).some((meal) => meal?.name) : false;
  const weekly = plan.weeklyPlan
    ? Object.values(plan.weeklyPlan).some(
        (day) => day?.breakfast?.name || day?.lunch?.name || day?.dinner?.name
      )
    : false;
  return meals || weekly;
}

export function applyGeneratedDietPlan(session: GeneratedDietSession) {
  if (!hasPlanContent(session?.plan)) return;
  memoryPlan = session;
}

export function clearGeneratedDietPlan() {
  memoryPlan = null;
}

export function storeGeneratedDietPlan(session: GeneratedDietSession) {
  applyGeneratedDietPlan(session);
  purgeLegacyPlanStorage();
  void persistPlanCache({ diet: session });
}

export function readGeneratedDietPlan(): GeneratedDietSession | null {
  if (hasPlanContent(memoryPlan?.plan)) return memoryPlan;
  return null;
}
