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

const PENDING_KEY = "fyte.pending-diet-generation";

export type PendingDietGeneration = {
  formData?: DietPlanFormData;
  fromLogs?: boolean;
  error?: string;
};

let pendingGeneration: PendingDietGeneration | null = null;

function readPendingStorage(): PendingDietGeneration | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingDietGeneration;
    if (!parsed?.formData && !parsed?.fromLogs && !parsed?.error) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePendingStorage(value: PendingDietGeneration | null) {
  if (typeof window === "undefined") return;
  try {
    if (!value) sessionStorage.removeItem(PENDING_KEY);
    else sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
  } catch {
    /* private mode */
  }
}

export function setPendingDietGeneration(formData: DietPlanFormData) {
  pendingGeneration = { formData };
  writePendingStorage(pendingGeneration);
}

export function setPendingDietFromLogs() {
  pendingGeneration = { fromLogs: true };
  writePendingStorage(pendingGeneration);
}

export function setPendingDietError(message: string) {
  const current = readPendingDietGeneration();
  pendingGeneration = {
    formData: current?.formData,
    fromLogs: current?.fromLogs,
    error: message,
  };
  writePendingStorage(pendingGeneration);
}

export function clearPendingDietGeneration() {
  pendingGeneration = null;
  writePendingStorage(null);
}

export function readPendingDietGeneration(): PendingDietGeneration | null {
  if (pendingGeneration?.formData || pendingGeneration?.fromLogs || pendingGeneration?.error) {
    return pendingGeneration;
  }
  pendingGeneration = readPendingStorage();
  return pendingGeneration;
}
