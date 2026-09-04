import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import { requireUser } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { setCurrentWorkout, recacheWorkoutFromDb, dropWorkoutCache } from "@backend/features/plan-cache";

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
  await setCurrentWorkout(user.id, {
    formData: input.formData,
    plan: input.workoutPlan,
    id: data.id,
    title: data.title,
  });
  const { seedCoachFromPlans } = await import("@backend/features/coach");
  await seedCoachFromPlans(user.id, { supabase, user });
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
  const latest = await recacheWorkoutFromDb(user.id);
  if (!latest) await dropWorkoutCache(user.id);
}
