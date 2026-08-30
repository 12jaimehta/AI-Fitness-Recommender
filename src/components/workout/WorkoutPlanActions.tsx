"use client";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { deleteWorkoutPlan, getUserWorkoutPlans, saveWorkoutPlan, WorkoutPlanData } from "@/lib/service/dietWorkoutplan";
import { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import SavedPlanActions from "@/components/shared/SavedPlanActions";

interface WorkoutPlanActionsProps {
  formData: WorkoutPlanFormData;
  workoutPlan: WorkoutPlanData;
  onPlanLoaded?: (plan: WorkoutPlanData) => void;
}

export default function WorkoutPlanActions({ formData, workoutPlan }: WorkoutPlanActionsProps) {
  const { user } = useCurrentUser();

  return (
    <SavedPlanActions
      unsignedMessage="Sign in to save and manage your workout plans"
      savedListTitle="Saved Workout Plans"
      onSave={async () => {
        if (!user) return;
        await saveWorkoutPlan(user.id, formData, workoutPlan);
      }}
      onLoad={async () => {
        if (!user) return [];
        const plans = await getUserWorkoutPlans(user.id);
        return plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          created_at: plan.created_at,
        }));
      }}
      onDelete={async (planId) => {
        if (!user) return;
        await deleteWorkoutPlan(user.id, planId);
      }}
    />
  );
}
