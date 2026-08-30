"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import { generateAIDietPlan, saveDietPlan, storeGeneratedDietPlan } from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { readLastWorkoutForm } from "@frontend/features/plan-pairing";
import PageLoader from "@/components/ui/PageLoader";

const RefactoredMultiStepForm = dynamic(
  () => import("@/components/diet").then((m) => ({ default: m.RefactoredMultiStepForm })),
  {
    ssr: false,
    loading: () => <PageLoader />,
  }
);

export default function DietClientPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const submitting = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: DietPlanFormData) => {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setLoading(true);
    try {
      const workout = readLastWorkoutForm();
      const payload: DietPlanFormData = {
        ...data,
        pairedTrainingDays: workout?.workoutFrequency,
        pairedTrainingDuration: workout?.workoutDuration,
      };
      const plan = await generateAIDietPlan(payload);
      storeGeneratedDietPlan({ formData: payload, plan });
      if (user) {
        void saveDietPlan(user.id, data, plan).catch(() => {});
      }
      router.push("/diet/plan");
    } catch (err) {
      submitting.current = false;
      setLoading(false);
      setError(err instanceof Error ? err.message : "Could not make your meal plan. Try again.");
    }
  };

  return (
    <>
      {loading ? (
        <PageLoader
          overlay
          title="Making your meal plan"
          subtitle="This can take one to two minutes. Please wait."
        />
      ) : null}
      <div className="text-center space-y-10">
        {error ? (
          <p className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <RefactoredMultiStepForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </>
  );
}
