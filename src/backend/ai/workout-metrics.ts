import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { ProgramGoal } from "@/shared/lib/program-goals";
import { coerceProgramGoal } from "@/shared/lib/program-goals";

const BASE_CALORIES_PER_MINUTE = {
  beginner: 5,
  intermediate: 8,
  advanced: 12,
} as const;

const GOAL_MULTIPLIERS: Record<ProgramGoal, number> = {
  fat_loss: 1.2,
  bodybuilding: 0.9,
  strength: 0.8,
  general_fitness: 1.0,
  hyrox: 1.35,
  ironman: 1.4,
  running: 1.3,
  athletic: 1.35,
};

const REST_DAYS: Record<string, string[]> = {
  "2": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "3": ["Sunday", "Tuesday", "Thursday", "Saturday"],
  "4": ["Sunday", "Wednesday", "Saturday"],
  "5": ["Sunday", "Friday"],
  "6": ["Sunday"],
};

export type WorkoutMetrics = {
  estimatedCaloriesBurn: number;
  recommendedRestDays: string[];
};

export function calculateWorkoutMetrics(userData: WorkoutPlanFormData): WorkoutMetrics {
  const duration = parseInt(userData.workoutDuration, 10);
  const goal = coerceProgramGoal(userData.goal) || "general_fitness";
  const caloriesPerMinute =
    BASE_CALORIES_PER_MINUTE[userData.fitnessLevel] * GOAL_MULTIPLIERS[goal];

  return {
    estimatedCaloriesBurn: Math.round(caloriesPerMinute * duration),
    recommendedRestDays: REST_DAYS[userData.workoutFrequency] || ["Sunday"],
  };
}
