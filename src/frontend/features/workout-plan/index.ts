/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@frontend/shared/api/http";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import {
  storeGeneratedWorkoutPlan,
  readGeneratedWorkoutPlan,
  clearGeneratedWorkoutPlan,
  type GeneratedWorkoutSession,
} from "./generated-session";
import { hydratePlanCache } from "@frontend/features/plan-cache";

export type { WorkoutPlanData, DailyWorkout, Exercise } from "@/shared/types";
export { storeGeneratedWorkoutPlan, readGeneratedWorkoutPlan, type GeneratedWorkoutSession };

let inFlight: Promise<WorkoutPlanData> | null = null;
let inFlightKey = "";

export async function generateAIWorkoutPlan(
  userData: WorkoutPlanFormData
): Promise<WorkoutPlanData> {
  const key = JSON.stringify(userData);
  if (inFlight && inFlightKey === key) return inFlight;

  inFlightKey = key;
  inFlight = api<WorkoutPlanData>("/api/generate-workout", {
    method: "POST",
    body: JSON.stringify(userData),
  }).finally(() => {
    inFlight = null;
    inFlightKey = "";
  });

  return inFlight;
}

export type SavedWorkoutPlan = {
  id: string;
  user_id: string;
  form_data: WorkoutPlanFormData;
  workout_plan: WorkoutPlanData;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
};

export async function saveWorkoutPlan(
  _userId: string,
  formData: WorkoutPlanFormData,
  workoutPlan: WorkoutPlanData,
  title?: string,
  description?: string
) {
  const result = await api<{ data: SavedWorkoutPlan }>("/api/workout-plans", {
    method: "POST",
    body: JSON.stringify({ formData, workoutPlan, title, description }),
  });
  return result.data;
}

export async function getUserWorkoutPlans(_userId: string) {
  const result = await api<{ data: SavedWorkoutPlan[] }>("/api/workout-plans");
  return result.data;
}

export async function deleteWorkoutPlan(_userId: string, planId: string) {
  await api(`/api/workout-plans/${planId}`, { method: "DELETE" });
  clearGeneratedWorkoutPlan();
}

export async function loadCurrentWorkoutPlan(): Promise<GeneratedWorkoutSession | null> {
  await hydratePlanCache();
  return readGeneratedWorkoutPlan();
}
