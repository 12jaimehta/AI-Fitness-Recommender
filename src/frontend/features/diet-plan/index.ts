/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@frontend/shared/api/http";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";
import {
  storeGeneratedDietPlan,
  readGeneratedDietPlan,
  clearGeneratedDietPlan,
  type GeneratedDietSession,
} from "./generated-session";
import { hydratePlanCache } from "@frontend/features/plan-cache";

export type { DietPlanData, MealData, DailyMeals } from "@/shared/types";
export { storeGeneratedDietPlan, readGeneratedDietPlan, type GeneratedDietSession };

let inFlight: Promise<DietPlanData> | null = null;
let inFlightKey = "";

export async function generateAIDietPlan(userData: DietPlanFormData): Promise<DietPlanData> {
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
