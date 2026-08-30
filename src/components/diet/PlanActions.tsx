"use client";

import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { DietPlanFormData } from "../../lib/validation/dietPlanSchema";
import { DietPlanData } from "../../lib/types";
import { deleteDietPlan, getUserDietPlans, SavedDietPlan, saveDietPlan } from "@/lib/service/dietWorkoutplan";
import SavedPlanActions from "@/components/shared/SavedPlanActions";

interface PlanActionsProps {
  formData: DietPlanFormData;
  dietPlan: DietPlanData;
  onPlanLoaded?: (plan: DietPlanData) => void;
}

export default function PlanActions({ formData, dietPlan }: PlanActionsProps) {
  const { user } = useCurrentUser();

  return (
    <SavedPlanActions
      unsignedMessage="Sign in to save and manage your diet plans"
      savedListTitle="Saved Diet Plans"
      onSave={async () => {
        if (!user) return;
        await saveDietPlan(user.id, formData, dietPlan);
      }}
      onLoad={async () => {
        if (!user) return [];
        const plans = await getUserDietPlans(user.id);
        return plans.map((plan: SavedDietPlan) => ({
          id: plan.id,
          title: plan.title,
          description: plan.description,
          created_at: plan.created_at,
        }));
      }}
      onDelete={async (planId) => {
        if (!user) return;
        await deleteDietPlan(user.id, planId);
      }}
    />
  );
}
