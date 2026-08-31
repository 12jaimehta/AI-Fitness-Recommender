import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { programGoalLabel } from "@/shared/lib/program-goals";
import { setCurrentDiet, recacheDietFromDb, dropDietCache } from "@backend/features/plan-cache";

function generatePlanTitle(formData: DietPlanFormData): string {
  const preferenceMap: Record<string, string> = {
    vegetarian: "Vegetarian",
    "non-vegetarian": "Non-Vegetarian",
    eggetarian: "Eggetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
  };
  return `${programGoalLabel(formData.goal)} ${preferenceMap[formData.dietaryPreference] || "Custom"} Plan`;
}

function generatePlanDescription(formData: DietPlanFormData): string {
  const weight =
    formData.weightUnit === "kg" ? `${formData.weight} kg` : `${formData.weight} lbs`;
  const height =
    formData.heightUnit === "cm"
      ? `${formData.height} cm`
      : `${formData.feet}'${formData.inches}"`;
  return `${weight}, ${height}, ${formData.age} years old - ${formData.dietaryPreference} diet for ${programGoalLabel(formData.goal)}`;
}

export async function createDietPlan(input: {
  formData: DietPlanFormData;
  dietPlan: DietPlanData;
  title?: string;
  description?: string;
}) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("diet_plans")
    .insert({
      user_id: user.id,
      form_data: input.formData,
      diet_plan: input.dietPlan,
      title: input.title || generatePlanTitle(input.formData),
      description: input.description || generatePlanDescription(input.formData),
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message, 400);
  await setCurrentDiet(user.id, {
    formData: input.formData,
    plan: input.dietPlan,
    id: data.id,
    title: data.title,
  });
  return data;
}

export async function listDietPlans() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("diet_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, 400);
  return data || [];
}

export async function deleteDietPlan(planId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("diet_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) throw new ApiError(error.message, 400);
  const latest = await recacheDietFromDb(user.id);
  if (!latest) await dropDietCache(user.id);
}
