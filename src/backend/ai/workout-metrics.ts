import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";

const BASE_CALORIES_PER_MINUTE = {
  beginner: 5,
  intermediate: 8,
  advanced: 12,
} as const;

const GOAL_MULTIPLIERS: Record<WorkoutPlanFormData["goal"], number> = {
  fat_loss: 1.2,
  muscle_gain: 0.9,
  strength: 0.8,
  endurance: 1.3,
  general_fitness: 1.0,
  athletic_performance: 1.4,
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
  const caloriesPerMinute =
    BASE_CALORIES_PER_MINUTE[userData.fitnessLevel] * GOAL_MULTIPLIERS[userData.goal];

  return {
    estimatedCaloriesBurn: Math.round(caloriesPerMinute * duration),
    recommendedRestDays: REST_DAYS[userData.workoutFrequency] || ["Sunday"],
  };
}
