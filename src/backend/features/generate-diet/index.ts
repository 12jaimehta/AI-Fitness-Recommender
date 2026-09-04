import { dietPlanSchema, type DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DailyMeals, DietPlanData } from "@/shared/types";
import { completeJson } from "@backend/shared/api/grok";
import { ApiError, isRateLimitError } from "@backend/shared/lib/errors";
import { applyCalorieOverride, calculateNutritionTargets, type NutritionTargets } from "@backend/ai/nutrition";
import { buildDietPrompt } from "@backend/ai/prompts/diet";
import { generateFallbackPlan } from "@backend/ai/fallbacks/diet";
import { programGoalLabel } from "@/shared/lib/program-goals";
import {
  createThoughtNote,
  scanDietPlanJson,
  withThoughtHeartbeats,
  type StreamThoughtScan,
} from "@backend/shared/lib/plan-thoughts";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DIET_PREF: Record<DietPlanFormData["dietaryPreference"], string> = {
  vegetarian: "Vegetarian",
  "non-vegetarian": "Non-vegetarian",
  eggetarian: "Eggetarian",
  vegan: "Vegan",
  pescatarian: "Pescatarian",
};

export type DietGenerateOptions = {
  nutrition?: NutritionTargets;
  calorieOverride?: number;
  logNotes?: string;
  onThought?: (text: string) => void;
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
  const note = createThoughtNote(options?.onThought);
  note("Reading your details.");

  let nutrition = options?.nutrition || calculateNutritionTargets(userData);
  if (options?.calorieOverride != null) {
    nutrition = applyCalorieOverride(nutrition, options.calorieOverride);
  }

  const weekly = userData.planType === "weekly";
  const weight =
    userData.weightUnit === "lbs" ? `${userData.weight} lb` : `${userData.weight} kg`;
  note(`${weight}. ${programGoalLabel(userData.goal)}. ${userData.mealsPerDay} meals a day.`);
  note(`${DIET_PREF[userData.dietaryPreference]} meals. ${weekly ? "Building a full week." : "Building a daily template."}`);
  if (userData.allergies?.trim()) {
    note(`Keeping out: ${userData.allergies.trim().slice(0, 48)}.`);
  }
  if (userData.favoriteFoods?.trim()) {
    note("Working in foods you already like.");
  }
  note(`Calories set to ${nutrition.calories} kcal, ${nutrition.protein} g protein.`);
  note("Asking the coach to write the meals.");
  if (options?.onThought) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  const prompt = buildDietPrompt(userData, nutrition, options?.logNotes);
  const scan: StreamThoughtScan = { left: 12, seen: new Set() };
  const jsonOptions = {
    maxTokens: weekly ? 16000 : 4000,
    system:
      "You are an expert nutritionist. Reply with compact valid JSON only. Keep ingredientBreakdown to one short line. Two alternatives per weekly meal, one-line description.",
  };

  try {
    const plan = options?.onThought
      ? await withThoughtHeartbeats(
          note,
          weekly
            ? [
                "Balancing breakfast, lunch, and dinner around your training.",
                "Checking each plate hits the macros.",
                "Writing swaps for days you cannot cook the same thing.",
                "Filling the rest of the week.",
              ]
            : [
                "Balancing breakfast, lunch, and dinner around your training.",
                "Checking each plate hits the macros.",
                "Writing simple swaps.",
              ],
          (stopHeartbeats) =>
            completeJson<DietPlanData>(prompt, {
              ...jsonOptions,
              onDelta: (text) => {
                stopHeartbeats();
                scanDietPlanJson(text, note, scan);
              },
            })
        )
      : await completeJson<DietPlanData>(prompt, jsonOptions);

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
