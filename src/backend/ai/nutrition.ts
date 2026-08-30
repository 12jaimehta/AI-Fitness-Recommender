import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { ProgramGoal } from "@/shared/lib/program-goals";
import { coerceProgramGoal } from "@/shared/lib/program-goals";

export type NutritionTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  weightKg: number;
  heightCm: number;
};

const ACTIVITY_MULTIPLIERS: Record<DietPlanFormData["activityLevel"], number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export function calculateNutritionTargets(userData: DietPlanFormData): NutritionTargets {
  const weightKg =
    userData.weightUnit === "lbs"
      ? parseFloat(userData.weight) * 0.453592
      : parseFloat(userData.weight);

  const heightCm =
    userData.heightUnit === "ftin"
      ? parseFloat(userData.feet || "0") * 30.48 + parseFloat(userData.inches || "0") * 2.54
      : parseFloat(userData.height || "0");

  const age = parseInt(userData.age, 10);

  let bmr: number;
  if (userData.gender === "male") {
    bmr = 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  } else {
    bmr = 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.33 * age;
  }

  let calories = Math.round(bmr * ACTIVITY_MULTIPLIERS[userData.activityLevel]);
  const goal = coerceProgramGoal(userData.goal) || (userData.goal as ProgramGoal);
  if (goal === "fat_loss") calories -= 500;
  else if (goal === "bodybuilding") calories += 250;
  else if (goal === "strength") calories += 150;
  else if (goal === "hyrox") calories += 300;
  else if (goal === "ironman") calories += 500;
  else if (goal === "running") calories += 250;
  else if (goal === "athletic") calories += 200;

  const proteinPerKg =
    goal === "fat_loss" || goal === "bodybuilding" || goal === "strength" ? 2.0 : goal === "hyrox" || goal === "ironman" ? 1.8 : 1.6;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat, weightKg, heightCm };
}

export function mealSlotGuide(mealsPerDay: DietPlanFormData["mealsPerDay"], calories: number) {
  switch (mealsPerDay) {
    case "3":
      return `- Breakfast (around ${Math.round(calories * 0.3)} calories)
- Lunch (around ${Math.round(calories * 0.4)} calories)
- Dinner (around ${Math.round(calories * 0.3)} calories)`;
    case "4":
      return `- Breakfast (around ${Math.round(calories * 0.25)} calories)
- Lunch (around ${Math.round(calories * 0.35)} calories)
- Dinner (around ${Math.round(calories * 0.3)} calories)
- Snacks (around ${Math.round(calories * 0.1)} calories)`;
    case "5":
      return `- Breakfast (around ${Math.round(calories * 0.25)} calories)
- Morning Snack (around ${Math.round(calories * 0.1)} calories)
- Lunch (around ${Math.round(calories * 0.3)} calories)
- Evening Snack (around ${Math.round(calories * 0.1)} calories)
- Dinner (around ${Math.round(calories * 0.25)} calories)`;
    default:
      return `- Breakfast (around ${Math.round(calories * 0.2)} calories)
- Morning Snack (around ${Math.round(calories * 0.1)} calories)
- Lunch (around ${Math.round(calories * 0.3)} calories)
- Afternoon Snack (around ${Math.round(calories * 0.1)} calories)
- Evening Snack (around ${Math.round(calories * 0.1)} calories)
- Dinner (around ${Math.round(calories * 0.2)} calories)`;
  }
}

const MEAL_FIELD =
  '{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": string }';

export function mealJsonFields(mealsPerDay: DietPlanFormData["mealsPerDay"]) {
  const extra: string[] = [];
  if (parseInt(mealsPerDay, 10) > 3) {
    extra.push(`"snacks": ${MEAL_FIELD}`);
  }
  if (parseInt(mealsPerDay, 10) > 4) {
    extra.push(`"morningSnack": ${MEAL_FIELD}`);
    extra.push(`"eveningSnack": ${MEAL_FIELD}`);
  }
  if (parseInt(mealsPerDay, 10) > 5) {
    extra.push(`"afternoonSnack": ${MEAL_FIELD}`);
  }
  return extra;
}
