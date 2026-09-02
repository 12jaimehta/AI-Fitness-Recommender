import { dietPlanSchema, type DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DailyMeals, DietPlanData } from "@/shared/types";
import { completeJson } from "@backend/shared/api/grok";
import { ApiError, isRateLimitError } from "@backend/shared/lib/errors";
import { applyCalorieOverride, calculateNutritionTargets, type NutritionTargets } from "@backend/ai/nutrition";
import { buildDietPrompt } from "@backend/ai/prompts/diet";
import { generateFallbackPlan } from "@backend/ai/fallbacks/diet";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type DietGenerateOptions = {
  nutrition?: NutritionTargets;
  calorieOverride?: number;
  logNotes?: string;
};

function hasCoreMeals(meals?: DailyMeals | null): meals is DailyMeals {
  return Boolean(meals?.breakfast?.name && meals.lunch?.name && meals.dinner?.name);
}

function isValidDietPlan(plan: DietPlanData | null, weekly: boolean): plan is DietPlanData {
  if (!hasCoreMeals(plan?.meals) || !Array.isArray(plan.nutritionTips)) return false;
  if (!weekly) return true;
  return WEEKDAYS.every((day) => hasCoreMeals(plan.weeklyPlan?.[day]));
}

function fillWeeklyPlan(plan: DietPlanData): DietPlanData {
  const meals = plan.meals!;
  const weekly = { ...(plan.weeklyPlan ?? {}) } as NonNullable<DietPlanData["weeklyPlan"]>;
  for (const day of WEEKDAYS) {
    if (!hasCoreMeals(weekly[day])) weekly[day] = meals;
  }
  return { ...plan, weeklyPlan: weekly };
}

export async function generateDietPlan(input: unknown, options?: DietGenerateOptions): Promise<DietPlanData> {
  const parsed = dietPlanSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Invalid request body", 400, parsed.error.flatten());
  }

  const userData = parsed.data as DietPlanFormData;
  let nutrition = options?.nutrition || calculateNutritionTargets(userData);
  if (options?.calorieOverride != null) {
    nutrition = applyCalorieOverride(nutrition, options.calorieOverride);
  }
  const prompt = buildDietPrompt(userData, nutrition, options?.logNotes);
  const weekly = userData.planType === "weekly";

  try {
    const plan = await completeJson<DietPlanData>(prompt, {
      maxTokens: weekly ? 16000 : 4000,
      system:
        "You are an expert nutritionist. Reply with compact valid JSON only. Keep ingredientBreakdown to one short line. Two alternatives per weekly meal, one-line description.",
    });

    if (!isValidDietPlan(plan, weekly)) {
      const fallback = generateFallbackPlan(
        userData,
        nutrition.calories,
        nutrition.protein,
        nutrition.carbs,
        nutrition.fat
      );
      return weekly ? fillWeeklyPlan(fallback) : fallback;
    }

    return fillWeeklyPlan(plan);
  } catch (error) {
    if (isRateLimitError(error)) {
      throw new ApiError(
        "Rate limit exceeded. Please try again in a few minutes.",
        429,
        "Grok API rate limit reached. Please try again later."
      );
    }
    const fallback = generateFallbackPlan(
      userData,
      nutrition.calories,
      nutrition.protein,
      nutrition.carbs,
      nutrition.fat
    );
    return weekly ? fillWeeklyPlan(fallback) : fallback;
  }
}
