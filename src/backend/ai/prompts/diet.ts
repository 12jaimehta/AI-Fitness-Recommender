import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import { mealJsonFields, mealSlotGuide, type NutritionTargets } from "../nutrition";

const MEAL_SHAPE =
  '{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": string }';
const WEEKLY_MEAL_SHAPE =
  '{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": string, "alternatives": [{ "name": string, "calories": number, "description": string }] }';

export function buildDietPrompt(userData: DietPlanFormData, nutrition: NutritionTargets) {
  const height =
    userData.heightUnit === "ftin"
      ? `${userData.feet}'${userData.inches}"`
      : `${userData.height} cm`;

  const extraMeals = mealJsonFields(userData.mealsPerDay);
  const extraBlock = extraMeals.length ? extraMeals.join(",\n      ") + "," : "";
  const weekly = userData.planType === "weekly";

  const mealsSchema = `{
    "breakfast": ${MEAL_SHAPE},
    "lunch": ${MEAL_SHAPE},
    "dinner": ${MEAL_SHAPE},
    ${extraBlock}
  }`;

  const weeklyExtras = extraMeals.length ? `, ${extraMeals.join(", ")}` : "";
  const weeklySchema = weekly
    ? `,
  "weeklyPlan": {
    "monday": { "breakfast": ${WEEKLY_MEAL_SHAPE}, "lunch": ${WEEKLY_MEAL_SHAPE}, "dinner": ${WEEKLY_MEAL_SHAPE}${weeklyExtras} },
    "tuesday": {},
    "wednesday": {},
    "thursday": {},
    "friday": {},
    "saturday": {},
    "sunday": {}
  }`
    : "";

  return `You are an expert nutritionist. Based on the following user data, generate a complete diet plan:
---
Age: ${userData.age}
Gender: ${userData.gender}
Weight: ${userData.weight} ${userData.weightUnit}
Height: ${height}
Goal: ${userData.goal}
Dietary Preference: ${userData.dietaryPreference}
Activity Level: ${userData.activityLevel}
Allergies: ${userData.allergies || "None"}
Medical Conditions: ${userData.medicalConditions || "None"}
Favorite Foods: ${userData.favoriteFoods || "None specified"}
Plan Type: ${weekly ? "7-Day Weekly Plan" : "Single Day Plan"}
Meals Per Day: ${userData.mealsPerDay} meals
Calorie Target: ${nutrition.calories} calories per day
Protein Target: ${nutrition.protein}g per day
Carb Target: ${nutrition.carbs}g per day
Fat Target: ${nutrition.fat}g per day
---

${
  weekly
    ? `Generate a 7-day weekly plan AND a single-day "meals" object (use Monday's meals). Each day must have ${userData.mealsPerDay} DIFFERENT meals. Exactly 2 short alternatives per weekly meal.`
    : `Generate a single-day plan with ${userData.mealsPerDay} meals. Do not include weeklyPlan.`
}

${userData.favoriteFoods ? `IMPORTANT: Incorporate favorite foods: ${userData.favoriteFoods}` : ""}

Meal structure:
${mealSlotGuide(userData.mealsPerDay, nutrition.calories)}

For each meal provide specific quantities (e.g. "150g grilled tofu", "1 cup cooked quinoa") and a ONE-LINE ingredient calorie breakdown. Do not write long paragraphs.

Keep JSON compact. No markdown.

Reply with strict JSON:
{
  "meals": ${mealsSchema}${weeklySchema},
  "nutritionTips": [string],
  "calorieTarget": "${nutrition.calories}",
  "proteinTarget": "${nutrition.protein}",
  "carbTarget": "${nutrition.carbs}",
  "fatTarget": "${nutrition.fat}"
}

All meals must match ${userData.dietaryPreference} and the goal ${userData.goal}.`;
}
