"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import { beginWorkoutPlanGeneration } from "@/lib/service/dietWorkoutplan";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";
import { FormPageSkeleton } from "@/components/ui/Skeleton";

const WorkoutMultiStepForm = dynamic(
  () => import("@/components/workout").then((m) => ({ default: m.WorkoutMultiStepForm })),
  {
    ssr: false,
    loading: () => <FormPageSkeleton />,
  }
);

export default function WorkoutClientPage() {
  const router = useRouter();
  const submitting = useRef(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: WorkoutPlanFormData) => {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    try {
      await hydratePlanCache();
      const diet = readGeneratedDietPlan();
      beginWorkoutPlanGeneration({
        ...data,
        pairedCalorieTarget: diet?.plan.calorieTarget,
        pairedProteinTarget: diet?.plan.proteinTarget,
      });
      router.push("/workout/plan");
    } catch (err) {
      submitting.current = false;
      setError(err instanceof Error ? err.message : "Could not make your workout plan. Try again.");
    }
  };

  return (
    <div className="space-y-10">
      {error ? (
        <p className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <WorkoutMultiStepForm onSubmit={handleSubmit} loading={false} />
    </div>
  );
}
