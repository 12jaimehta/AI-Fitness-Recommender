import { completeJson, completeJsonWithImage } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { cacheIncr } from "@backend/shared/lib/redis";
import type { CoachMealDraft, CoachSwapOption } from "@/shared/types/coach";

const SYSTEM =
  "You are Fyte's gym trainer. JSON only. No judgement words (cheat, bad, junk). Indian food portions. Near-around calories.";

export async function limitCoachAi(userId: string) {
  const n = await cacheIncr(`fyte:${userId}:coach-ai`, 60);
  if (n != null && n > 8) {
    throw new ApiError("Give the coach a minute, then try again.", 429);
  }
}

function parsePrompt(slotTitle: string, budget: number, text: string) {
  return `Planned ${slotTitle} is about ${budget} kcal.
User said or showed: ${text}

Return JSON:
{
  "meal_name": string,
  "category": "street" | "home" | "restaurant" | "packaged",
  "kcal_low": number,
  "kcal_high": number,
  "protein_g": number,
  "unknowns": string[],
  "explanation": string
}
unknowns: only keys from portion, butter, sauce, drink that you still need. Street food usually needs butter and drink if unstated.`;
}

function asDraft(raw: Partial<CoachMealDraft>, fallbackName: string): CoachMealDraft {
  const low = Math.max(80, Number(raw.kcal_low || 400));
  const high = Math.max(low, Number(raw.kcal_high || low + 150));
  const unknowns = Array.isArray(raw.unknowns)
    ? raw.unknowns.map((item) => String(item).toLowerCase()).filter(Boolean)
    : ["portion"];
  return {
    meal_name: String(raw.meal_name || fallbackName).slice(0, 80),
    category: String(raw.category || "home"),
    kcal_low: Math.round(low),
    kcal_high: Math.round(high),
    protein_g: Math.round(Number(raw.protein_g || 15)),
    unknowns,
    explanation: String(raw.explanation || "Near-around estimate. A couple of details will tighten it."),
  };
}

export async function parseMeal(input: {
  userId: string;
  slotTitle: string;
  budgetKcal: number;
  text: string;
  imageDataUrl?: string;
}) {
  await limitCoachAi(input.userId);
  const prompt = parsePrompt(input.slotTitle, input.budgetKcal, input.text || "Photo of the plate.");
  try {
    const raw = input.imageDataUrl
      ? await completeJsonWithImage<Partial<CoachMealDraft>>(prompt, input.imageDataUrl, {
          maxTokens: 500,
          system: SYSTEM,
          timeoutMs: 45_000,
        })
      : await completeJson<Partial<CoachMealDraft>>(prompt, { maxTokens: 500, system: SYSTEM, timeoutMs: 45_000 });
    return asDraft(raw, input.text.slice(0, 80) || "Meal");
  } catch {
    return asDraft(
      { meal_name: input.text.slice(0, 80) || "Meal", unknowns: ["portion", "butter", "drink"] },
      "Meal"
    );
  }
}

export async function proposeMealSwaps(input: {
  userId: string;
  slotTitle: string;
  budgetKcal: number;
  proteinG: number;
  preference: string;
  why: string;
  instead: string;
  hates: string[];
}) {
  await limitCoachAi(input.userId);
  const prompt = `Replace ONLY ${input.slotTitle}. Budget ${input.budgetKcal} kcal (±10%), protein at least ${Math.round(input.proteinG * 0.8)} g.
Dietary / style: ${input.preference || "same as current plan"}.
Why they rejected it: ${input.why}. Prefer: ${input.instead}.
Do not use: ${input.hates.join(", ") || "nothing listed"}.
JSON: { "options": [{ "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": string, "description": string }] }
Exactly 3 realistic options they can actually eat.`;

  try {
    const raw = await completeJson<{ options?: CoachSwapOption[] }>(prompt, {
      maxTokens: 900,
      system: SYSTEM,
      timeoutMs: 45_000,
    });
    const options = Array.isArray(raw.options) ? raw.options : [];
    return options.slice(0, 3).map((option, index) => ({
      id: `opt-${index + 1}`,
      name: String(option.name || `Option ${index + 1}`).slice(0, 80),
      calories: Math.round(Number(option.calories || input.budgetKcal)),
      protein: Math.round(Number(option.protein || input.proteinG)),
      carbs: Math.round(Number(option.carbs || 40)),
      fat: Math.round(Number(option.fat || 12)),
      ingredientBreakdown: String(option.ingredientBreakdown || "").slice(0, 160),
      description: String(option.description || "").slice(0, 160),
    }));
  } catch {
    return [
      {
        id: "opt-1",
        name: "Dal, rice, and salad",
        calories: input.budgetKcal,
        protein: Math.max(20, input.proteinG),
        carbs: 55,
        fat: 10,
        ingredientBreakdown: "1 katori dal, 1 bowl rice, cucumber salad",
        description: "Simple, same budget.",
      },
      {
        id: "opt-2",
        name: "Curd rice and eggs or paneer",
        calories: input.budgetKcal,
        protein: Math.max(22, input.proteinG),
        carbs: 45,
        fat: 14,
        ingredientBreakdown: "Curd rice + 2 eggs or 80g paneer",
        description: "Faster to plate.",
      },
      {
        id: "opt-3",
        name: "Roti, sabzi, and dahi",
        calories: input.budgetKcal,
        protein: Math.max(18, input.proteinG),
        carbs: 48,
        fat: 12,
        ingredientBreakdown: "2 roti, seasonal sabzi, 1 katori dahi",
        description: "Home-style, same slot.",
      },
    ] satisfies CoachSwapOption[];
  }
}
