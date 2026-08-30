import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";

function generateTitle(formData: WorkoutPlanFormData) {
  return `${formData.goal.replace("_", " ")} ${formData.fitnessLevel} plan`;
}

export async function createWorkoutPlan(input: {
  formData: WorkoutPlanFormData;
  workoutPlan: WorkoutPlanData;
  title?: string;
  description?: string;
}) {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_plans")
    .insert({
      user_id: user.id,
      form_data: input.formData,
      workout_plan: input.workoutPlan,
      title: input.title || generateTitle(input.formData),
      description: input.description || `${formDataFrequency(input.formData)} · ${input.formData.availableEquipment}`,
    })
    .select()
    .single();

  if (error) throw new ApiError(error.message, 400);
  return data;
}

function formDataFrequency(formData: WorkoutPlanFormData) {
  return `${formData.workoutFrequency} days/week · ${formData.workoutDuration} min`;
}

export async function listWorkoutPlans() {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new ApiError(error.message, 400);
  return data || [];
}

export async function deleteWorkoutPlan(planId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", planId)
    .eq("user_id", user.id);

  if (error) throw new ApiError(error.message, 400);
}
