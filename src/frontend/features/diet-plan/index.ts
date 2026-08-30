/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@frontend/shared/api/http";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";
import {
  storeGeneratedDietPlan,
  readGeneratedDietPlan,
  type GeneratedDietSession,
} from "./generated-session";

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
  const stored = readGeneratedDietPlan();
  if (stored) return stored;

  try {
    const plans = await getUserDietPlans("");
    const latest = plans?.[0];
    if (!latest?.diet_plan) return null;
    const session = { formData: latest.form_data, plan: latest.diet_plan };
    storeGeneratedDietPlan(session);
    return session;
  } catch {
    return null;
  }
}

export async function deleteDietPlan(_userId: string, planId: string) {
  await api(`/api/diet-plans/${planId}`, { method: "DELETE" });
}
