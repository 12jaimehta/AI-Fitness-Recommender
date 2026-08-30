import { completeJson } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { requireUser } from "@backend/shared/api/supabase";
import { parseIsoDate } from "@/shared/lib/plan-tracking";
import type { MealLogRow, MealSourceType, PlannedFoodItem } from "@/shared/types/progress-tracking";
import { getCurrentPlans } from "./current-plans";
import { throwIfSchemaMissing, utcToday } from "./db";
import { buildMealLogPrompt } from "@backend/ai/prompts/meal-log";

function asMealLog(row: Record<string, unknown>): MealLogRow {
  return {
    id: String(row.id),
    date: String(row.date).slice(0, 10),
    meal_slot: String(row.meal_slot),
    source_type: row.source_type as MealSourceType,
    meal_name: String(row.meal_name),
    items: Array.isArray(row.items) ? (row.items as PlannedFoodItem[]) : [],
    total_calories: Number(row.total_calories || 0),
    total_protein_g: Number(row.total_protein_g || 0),
    total_carbs_g: Number(row.total_carbs_g || 0),
    total_fat_g: Number(row.total_fat_g || 0),
    is_plan_compliant: Boolean(row.is_plan_compliant),
    ai_explanation: row.ai_explanation ? String(row.ai_explanation) : null,
  };
}

export async function listMealLogs(date: string) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("meal_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .order("logged_at", { ascending: true });
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return (data || []).map((row) => asMealLog(row as Record<string, unknown>));
}

export async function quickCheckMeal(input: { date?: string; meal_slot?: string }) {
  const slot = String(input.meal_slot || "").trim();
  if (!slot) throw new ApiError("meal_slot is required", 400);

  const { supabase, user } = await requireUser();
  const date = parseIsoDate(input.date, utcToday());
  const plans = await getCurrentPlans(date);
  const meal = plans.diet_plan?.meals.find((item) => item.slot === slot || item.meal_id === slot);
  if (!meal) throw new ApiError("That meal is not in today's diet plan. Save a diet plan first.", 400);

  const { data: existing, error: findError } = await supabase
    .from("meal_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .eq("meal_slot", meal.slot)
    .eq("source_type", "plan_checkoff")
    .maybeSingle();
  throwIfSchemaMissing(findError);

  if (existing?.id) {
    const { error: delError } = await supabase.from("meal_logs").delete().eq("id", existing.id).eq("user_id", user.id);
    if (delError) throw new ApiError(delError.message, 400);
    return { removed: true, data: null };
  }

  const { data, error } = await supabase
    .from("meal_logs")
    .insert({
      user_id: user.id,
      date,
      meal_slot: meal.slot,
      source_type: "plan_checkoff",
      meal_name: meal.items[0]?.name || meal.meal_name,
      items: meal.items,
      total_calories: meal.total_meal_calories,
      total_protein_g: meal.total_meal_protein,
      total_carbs_g: meal.items[0]?.carbs_g || 0,
      total_fat_g: meal.items[0]?.fat_g || 0,
      is_plan_compliant: true,
    })
    .select()
    .single();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return { removed: false, data: asMealLog(data as Record<string, unknown>) };
}

type ParsedMeal = {
  meal_name: string;
  items: PlannedFoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  confidence_score?: number;
  ai_explanation?: string;
};

export async function aiLogMeal(input: {
  date?: string;
  meal_slot?: string;
  input_type?: string;
  text_prompt?: string;
}) {
  const text = String(input.text_prompt || "").trim();
  if (!text) throw new ApiError("Describe what you ate.", 400);

  const { supabase, user } = await requireUser();
  const date = parseIsoDate(input.date, utcToday());
  const slot = String(input.meal_slot || "other").trim() || "other";

  let parsed: ParsedMeal;
  try {
    parsed = await completeJson<ParsedMeal>(buildMealLogPrompt(text), {
      maxTokens: 700,
      system:
        "You are Fyte AI's nutrition parser. Reply with valid JSON only. Be realistic with Indian and home-cooked portions.",
    });
  } catch {
    parsed = {
      meal_name: text.slice(0, 80),
      items: [{ name: text.slice(0, 80), portion: "1 serving", calories: 400, protein_g: 20, carbs_g: 40, fat_g: 12 }],
      total_calories: 400,
      total_protein_g: 20,
      total_carbs_g: 40,
      total_fat_g: 12,
      confidence_score: 0.3,
      ai_explanation: "Could not reach AI. Saved a rough estimate — edit by logging again if needed.",
    };
  }

  const items = Array.isArray(parsed.items) && parsed.items.length ? parsed.items : [];
  const totals = items.reduce(
    (sum, item) => ({
      calories: sum.calories + Number(item.calories || 0),
      protein: sum.protein + Number(item.protein_g || 0),
      carbs: sum.carbs + Number(item.carbs_g || 0),
      fat: sum.fat + Number(item.fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const { data, error } = await supabase
    .from("meal_logs")
    .insert({
      user_id: user.id,
      date,
      meal_slot: slot,
      source_type: input.input_type === "image" ? "ai_vision" : "ai_text",
      meal_name: parsed.meal_name || text.slice(0, 80),
      items,
      total_calories: parsed.total_calories || totals.calories,
      total_protein_g: parsed.total_protein_g || totals.protein,
      total_carbs_g: parsed.total_carbs_g || totals.carbs,
      total_fat_g: parsed.total_fat_g || totals.fat,
      is_plan_compliant: false,
      ai_confidence_score: parsed.confidence_score ?? 0.7,
      ai_explanation: parsed.ai_explanation || null,
    })
    .select()
    .single();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return asMealLog(data as Record<string, unknown>);
}
