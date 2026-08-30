import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";

const STORAGE_KEY = "fyte.generated-diet-plan";

export type GeneratedDietSession = {
  formData: DietPlanFormData;
  plan: DietPlanData;
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

function writeStorage(storage: Storage, session: GeneratedDietSession) {
  storage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readStorage(storage: Storage): GeneratedDietSession | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeneratedDietSession;
    if (!hasPlanContent(parsed?.plan)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function storeGeneratedDietPlan(session: GeneratedDietSession) {
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

export function readGeneratedDietPlan(): GeneratedDietSession | null {
  if (hasPlanContent(memoryPlan?.plan)) return memoryPlan;
  if (typeof window === "undefined") return null;
  return readStorage(sessionStorage) || readStorage(localStorage);
}
