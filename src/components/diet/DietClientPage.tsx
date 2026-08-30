"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import { generateAIDietPlan, saveDietPlan, storeGeneratedDietPlan } from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { readLastWorkoutForm } from "@frontend/features/plan-pairing";

const RefactoredMultiStepForm = dynamic(
  () => import("@/components/diet").then((m) => ({ default: m.RefactoredMultiStepForm })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[40vh] flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    ),
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
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-gray-50">
          <div className="h-12 w-12 rounded-full border-4 border-[#282828]/20 border-t-[#282828] animate-spin" />
          <p className="mt-6 text-base text-gray-700">Making your meal plan</p>
          <p className="mt-2 text-sm text-gray-500">This can take one to two minutes. Please wait.</p>
        </div>
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
