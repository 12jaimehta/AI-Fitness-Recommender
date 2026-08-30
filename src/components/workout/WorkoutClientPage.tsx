"use client";

import dynamic from "next/dynamic";
import { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import WorkoutPlanActions from "@/components/workout/WorkoutPlanActions";
import { generateAIWorkoutPlan, WorkoutPlanData } from "@/lib/service/dietWorkoutplan";
import PageLoader from "@/components/ui/PageLoader";
import PlanGeneratorClient from "@/components/shared/PlanGeneratorClient";

const WorkoutMultiStepForm = dynamic(
  () => import("@/components/workout").then((m) => ({ default: m.WorkoutMultiStepForm })),
  { ssr: false, loading: () => <PageLoader title="Loading Page ..." /> }
);

const WorkoutPlanDisplay = dynamic(
  () => import("@/components/workout").then((m) => ({ default: m.WorkoutPlanDisplay })),
  { ssr: false, loading: () => <PageLoader title="Loading Page ..." /> }
);

export default function WorkoutClientPage() {
  return (
    <PlanGeneratorClient<WorkoutPlanFormData, WorkoutPlanData>
      generate={generateAIWorkoutPlan}
      renderForm={({ onSubmit, loading }) => (
        <WorkoutMultiStepForm onSubmit={onSubmit} loading={loading} />
      )}
      renderDisplay={({ plan, onNewPlan, onRegenerate, loading }) => (
        <WorkoutPlanDisplay
          workoutPlan={plan}
          onNewPlan={onNewPlan}
          onRegenerate={onRegenerate}
          loading={loading}
        />
      )}
      renderActions={({ formData, plan }) => (
        <WorkoutPlanActions formData={formData} workoutPlan={plan} />
      )}
    />
  );
}
