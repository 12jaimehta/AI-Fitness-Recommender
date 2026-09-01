"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import { beginDietPlanGeneration } from "@/lib/service/dietWorkoutplan";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import { readLastWorkoutForm } from "@frontend/features/plan-pairing";
import { FormPageSkeleton } from "@/components/ui/Skeleton";

const RefactoredMultiStepForm = dynamic(
  () => import("@/components/diet").then((m) => ({ default: m.RefactoredMultiStepForm })),
  {
    ssr: false,
    loading: () => <FormPageSkeleton />,
  }
);

export default function DietClientPage() {
  const router = useRouter();
  const submitting = useRef(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: DietPlanFormData) => {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    try {
      await hydratePlanCache();
      const workout = readLastWorkoutForm();
      beginDietPlanGeneration({
        ...data,
        pairedTrainingDays: workout?.workoutFrequency,
        pairedTrainingDuration: workout?.workoutDuration,
      });
      router.push("/diet/plan");
    } catch (err) {
      submitting.current = false;
      setError(err instanceof Error ? err.message : "Could not make your meal plan. Try again.");
    }
  };

  return (
    <div className="space-y-10">
      {error ? (
        <p className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <RefactoredMultiStepForm onSubmit={handleSubmit} loading={false} />
    </div>
  );
}
