"use client";

import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan/generated-session";
import { readGeneratedWorkoutPlan } from "@frontend/features/workout-plan/generated-session";

export function readLastWorkoutForm(): WorkoutPlanFormData | null {
  return readGeneratedWorkoutPlan()?.formData || null;
}

export function readLastDietForm(): DietPlanFormData | null {
  return readGeneratedDietPlan()?.formData || null;
}
