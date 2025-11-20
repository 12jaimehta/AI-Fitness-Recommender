import { DietPlanFormData, WorkoutPlanFormData } from "../validation";

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

export interface DailyMeals {
  breakfast?: MealData;
  lunch?: MealData;
  dinner?: MealData;
  snacks?: MealData;
  morningSnack?: MealData;
  eveningSnack?: MealData;
  afternoonSnack?: MealData;
}

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

// Generate AI Diet Plan
export async function generateAIDietPlan(
  userData: DietPlanFormData
): Promise<DietPlanData> {
  const response = await fetch("/api/generate-diet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");

    if (response.status === 429) {
      throw new Error(
        "Rate limit exceeded. Please try again in a few minutes."
      );
    }

    throw new Error(errorText || "AI diet generation failed");
  }

  return await response.json();
}

// ============================
// Workout Plan Types
// ============================

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

export interface DailyWorkout {
  day: string;
  muscleGroups: string[];
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  estimatedCalories: string;
}

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

// Generate AI Workout Plan
export async function generateAIWorkoutPlan(
  userData: WorkoutPlanFormData
): Promise<WorkoutPlanData> {
  const response = await fetch("/api/generate-workout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || "AI workout generation failed");
  }

  return await response.json();
}

export interface SavedDietPlan {
  id: string;
  user_id: string;
  form_data: DietPlanFormData;
  diet_plan: DietPlanData;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
}

export async function saveDietPlan(
  userId: string,
  formData: DietPlanFormData,
  dietPlan: DietPlanData,
  title?: string,
  description?: string
): Promise<SavedDietPlan> {
  const response = await fetch("/api/diet-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      formData,
      dietPlan,
      title,
      description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save diet plan");
  }

  const result = await response.json();
  return result.data;
}

export async function getUserDietPlans(
  userId: string
): Promise<SavedDietPlan[]> {
  const response = await fetch(`/api/diet-plans?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get diet plans");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteDietPlan(
  userId: string,
  planId: string
): Promise<void> {
  const response = await fetch(
    `/api/diet-plans/${planId}?userId=${userId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete diet plan");
  }
}

export interface SavedWorkoutPlan {
  id: string;
  user_id: string;
  form_data: WorkoutPlanFormData;
  workout_plan: WorkoutPlanData;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
}

export async function saveWorkoutPlan(
  userId: string,
  formData: WorkoutPlanFormData,
  workoutPlan: WorkoutPlanData,
  title?: string,
  description?: string
): Promise<SavedWorkoutPlan> {
  const response = await fetch("/api/workout-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      formData,
      workoutPlan,
      title,
      description,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to save workout plan");
  }

  const result = await response.json();
  return result.data;
}

export async function getUserWorkoutPlans(
  userId: string
): Promise<SavedWorkoutPlan[]> {
  const response = await fetch(`/api/workout-plans?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to get workout plans");
  }

  const result = await response.json();
  return result.data;
}

export async function deleteWorkoutPlan(
  userId: string,
  planId: string
): Promise<void> {
  const response = await fetch(
    `/api/workout-plans/${planId}?userId=${userId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete workout plan");
  }
}
