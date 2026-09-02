/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@frontend/shared/api/http";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";
import {
  storeGeneratedDietPlan,
  readGeneratedDietPlan,
  clearGeneratedDietPlan,
  setPendingDietGeneration,
  setPendingDietFromLogs,
  setPendingDietError,
  clearPendingDietGeneration,
  readPendingDietGeneration,
  type GeneratedDietSession,
} from "./generated-session";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import type { CalorieStallResult } from "@/shared/lib/calorie-stall";

export type { DietPlanData, MealData, DailyMeals } from "@/shared/types";
export {
  storeGeneratedDietPlan,
  readGeneratedDietPlan,
  readPendingDietGeneration,
  type GeneratedDietSession,
};

let inFlight: Promise<DietPlanData> | null = null;
let inFlightKey = "";

function sameForm(a: DietPlanFormData, b: DietPlanFormData) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function generateAIDietPlan(userData: DietPlanFormData): Promise<DietPlanData> {
  const existing = readGeneratedDietPlan();
  if (existing && sameForm(existing.formData, userData)) return existing.plan;

  const key = JSON.stringify(userData);
  if (inFlight && inFlightKey === key) return inFlight;

  inFlightKey = key;
  inFlight = api<DietPlanData>("/api/generate-diet", {
    method: "POST",
    body: JSON.stringify(userData),
  }).finally(() => {
    inFlight = null;
    inFlightKey = "";
  });

  return inFlight;
}

export function beginDietPlanGeneration(formData: DietPlanFormData) {
  clearGeneratedDietPlan();
  setPendingDietGeneration(formData);
  void generateAIDietPlan(formData)
    .then((plan) => {
      storeGeneratedDietPlan({ formData, plan });
      clearPendingDietGeneration();
    })
    .catch((err) => {
      setPendingDietError(err instanceof Error ? err.message : "Could not make your meal plan. Try again.");
    });
}

export type AdvanceDietResult = {
  formData: DietPlanFormData;
  plan: DietPlanData;
  stall: CalorieStallResult;
};

let fromLogsInFlight: Promise<AdvanceDietResult> | null = null;

export async function generateDietFromLogs(): Promise<AdvanceDietResult> {
  if (fromLogsInFlight) return fromLogsInFlight;
  fromLogsInFlight = api<AdvanceDietResult>("/api/generate-diet/from-logs", {
    method: "POST",
  }).finally(() => {
    fromLogsInFlight = null;
  });
  return fromLogsInFlight;
}

export function beginDietFromLogs() {
  clearGeneratedDietPlan();
  setPendingDietFromLogs();
  void generateDietFromLogs()
    .then((result) => {
      storeGeneratedDietPlan({ formData: result.formData, plan: result.plan });
      clearPendingDietGeneration();
    })
    .catch((err) => {
      setPendingDietError(
        err instanceof Error ? err.message : "Could not build next week's diet from your logs. Try again."
      );
    });
}

export type DietPlanResolveResult =
  | { status: "ready"; session: GeneratedDietSession }
  | { status: "missing" }
  | { status: "error"; error: string };

export async function resolveDietPlan(userId?: string): Promise<DietPlanResolveResult> {
  const pending = readPendingDietGeneration();
  if (pending?.error) return { status: "error", error: pending.error };

  if (pending?.fromLogs) {
    try {
      const result = await generateDietFromLogs();
      const session = { formData: result.formData, plan: result.plan };
      storeGeneratedDietPlan(session);
      clearPendingDietGeneration();
      return { status: "ready", session };
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : "Could not build next week's diet from your logs. Try again.";
      setPendingDietError(error);
      return { status: "error", error };
    }
  }

  if (pending?.formData) {
    const already = readGeneratedDietPlan();
    if (already && sameForm(already.formData, pending.formData)) {
      clearPendingDietGeneration();
      if (userId) void saveDietPlan(userId, already.formData, already.plan).catch(() => {});
      return { status: "ready", session: already };
    }
    try {
      const plan = await generateAIDietPlan(pending.formData);
      const session = { formData: pending.formData, plan };
      storeGeneratedDietPlan(session);
      clearPendingDietGeneration();
      if (userId) void saveDietPlan(userId, pending.formData, plan).catch(() => {});
      return { status: "ready", session };
    } catch (err) {
      const error = err instanceof Error ? err.message : "Could not make your meal plan. Try again.";
      setPendingDietError(error);
      return { status: "error", error };
    }
  }

  const stored = await loadCurrentDietPlan();
  if (stored) return { status: "ready", session: stored };
  return { status: "missing" };
}

export type SavedDietPlan = {
  id: string;
  user_id: string;
  form_data: DietPlanFormData;
  diet_plan: DietPlanData;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
};

export async function saveDietPlan(
  _userId: string,
  formData: DietPlanFormData,
  dietPlan: DietPlanData,
  title?: string,
  description?: string
) {
  const result = await api<{ data: SavedDietPlan }>("/api/diet-plans", {
    method: "POST",
    body: JSON.stringify({ formData, dietPlan, title, description }),
  });
  return result.data;
}

export async function getUserDietPlans(_userId: string) {
  const result = await api<{ data: SavedDietPlan[] }>("/api/diet-plans");
  return result.data;
}

export async function loadCurrentDietPlan(): Promise<GeneratedDietSession | null> {
  await hydratePlanCache();
  return readGeneratedDietPlan();
}

export async function deleteDietPlan(_userId: string, planId: string) {
  await api(`/api/diet-plans/${planId}`, { method: "DELETE" });
  clearGeneratedDietPlan();
}
