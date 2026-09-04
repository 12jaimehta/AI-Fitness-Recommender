import type { AuthCtx } from "@backend/shared/api/supabase";
import { getCurrentDiet, setCurrentDiet } from "@backend/features/plan-cache";
import { weekdayFromIsoDate } from "@/shared/lib/plan-tracking";
import type { DailyMeals, DietPlanData, MealData } from "@/shared/types";
import type { CoachSwapOption } from "@/shared/types/coach";

function asMeal(option: CoachSwapOption): MealData {
  return {
    name: option.name,
    calories: option.calories,
    protein: option.protein,
    carbs: option.carbs,
    fat: option.fat,
    ingredientBreakdown: option.ingredientBreakdown,
  };
}

export async function patchDietSlot(
  auth: AuthCtx,
  date: string,
  slotKey: string,
  option: CoachSwapOption
) {
  const session = await getCurrentDiet(auth.user.id, auth);
  if (!session?.plan || !session.id) return;
  const day = weekdayFromIsoDate(date);
  const plan: DietPlanData = structuredClone(session.plan);
  const meal = asMeal(option);
  const key = slotKey as keyof DailyMeals;
  if (plan.weeklyPlan?.[day]) {
    plan.weeklyPlan[day] = { ...plan.weeklyPlan[day], [key]: meal };
  }
  if (plan.meals) {
    plan.meals = { ...plan.meals, [key]: meal };
  }
  await auth.supabase.from("diet_plans").update({ diet_plan: plan }).eq("id", session.id).eq("user_id", auth.user.id);
  await setCurrentDiet(auth.user.id, { ...session, plan });
}
