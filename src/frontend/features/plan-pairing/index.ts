"use client";

import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";

const WORKOUT_FORM_KEY = "fyte.last-workout-form";

export function storeLastWorkoutForm(form: WorkoutPlanFormData) {
  try {
    localStorage.setItem(WORKOUT_FORM_KEY, JSON.stringify(form));
  } catch {
    /* quota */
  }
}

export function readLastWorkoutForm(): WorkoutPlanFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKOUT_FORM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkoutPlanFormData;
  } catch {
    return null;
  }
}

export function readLastDietForm(): DietPlanFormData | null {
  return readGeneratedDietPlan()?.formData || null;
}
