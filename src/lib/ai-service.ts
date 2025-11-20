import { DietPlanFormData } from "./validation";
import { WorkoutPlanFormData } from "./validation";

export interface DietPlanData {
  meals?: {
    breakfast?: MealData;
    lunch?: MealData;
    dinner?: MealData;
    snacks?: MealData;
    morningSnack?: MealData;
    eveningSnack?: MealData;
    afternoonSnack?: MealData;
  };
  weeklyPlan?: {
    monday: DailyMeals;
    tuesday: DailyMeals;
    wednesday: DailyMeals;
    thursday: DailyMeals;
    friday: DailyMeals;
    saturday: DailyMeals;
    sunday: DailyMeals;
  };
  nutritionTips: string[];
  calorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
}

export interface DailyMeals {
  breakfast?: MealData;
  lunch?: MealData;
  dinner?: MealData;
  snacks?: MealData;
  morningSnack?: MealData;
  eveningSnack?: MealData;
  afternoonSnack?: MealData;
}

export interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientBreakdown: string;
  alternatives: {
    name: string;
    calories: number;
    description: string;
  }[];
}

export async function generateAIDietPlan(userData: DietPlanFormData): Promise<DietPlanData> {
  const response = await fetch("/api/generate-diet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    
    // Handle rate limit specifically
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    
    throw new Error(errorText || "AI diet generation failed");
  }

  const data = await response.json();
  return data;
}

// Workout Plan Types
export interface WorkoutPlanData {
  weeklyPlan?: {
    monday: DailyWorkout;
    tuesday: DailyWorkout;
    wednesday: DailyWorkout;
    thursday: DailyWorkout;
    friday: DailyWorkout;
    saturday: DailyWorkout;
    sunday: DailyWorkout;
  };
  singleWorkout?: DailyWorkout;
  workoutTips: string[];
  estimatedCaloriesBurn: string;
  recommendedRestDays: string[];
  warmupRoutine: Exercise[];
  cooldownRoutine: Exercise[];
}

export interface DailyWorkout {
  day: string;
  muscleGroups: string[];
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  estimatedCalories: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number | string;
  weight?: string;
  duration?: string;
  rest: string;
  instructions: string;
  muscleGroup: string;
  difficulty: string;
  alternatives: {
    name: string;
    description: string;
  }[];
}

export async function generateAIWorkoutPlan(userData: WorkoutPlanFormData): Promise<WorkoutPlanData> {
  const response = await fetch("/api/generate-workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "AI workout generation failed");
  }

  const data = await response.json();
  return data;
}
