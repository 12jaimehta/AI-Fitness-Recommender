"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import {
  generateAIWorkoutPlan,
  saveWorkoutPlan,
  storeGeneratedWorkoutPlan,
} from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { storeLastWorkoutForm } from "@frontend/features/plan-pairing";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";

const WorkoutMultiStepForm = dynamic(
  () => import("@/components/workout").then((m) => ({ default: m.WorkoutMultiStepForm })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    ),
  }
);

export default function WorkoutClientPage() {
  const router = useRouter();
  const { user } = useCurrentUser();
  const submitting = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data: WorkoutPlanFormData) => {
    if (submitting.current) return;
    submitting.current = true;
    setError("");
    setLoading(true);
    try {
      const diet = readGeneratedDietPlan();
      const payload: WorkoutPlanFormData = {
        ...data,
        pairedCalorieTarget: diet?.plan.calorieTarget,
        pairedProteinTarget: diet?.plan.proteinTarget,
      };
      storeLastWorkoutForm(payload);
      const plan = await generateAIWorkoutPlan(payload);
      storeGeneratedWorkoutPlan({ formData: payload, plan });
      if (user) {
        void saveWorkoutPlan(user.id, payload, plan).catch(() => {});
      }
      router.push("/workout/plan");
    } catch (err) {
      submitting.current = false;
      setLoading(false);
      setError(err instanceof Error ? err.message : "Could not make your workout plan. Try again.");
    }
  };

  return (
    <>
      {loading ? (
        <div className="fixed inset-0 z-60 flex flex-col items-center justify-center bg-gray-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#282828]/20 border-t-[#282828]" />
          <p className="mt-6 text-base text-gray-700">Making your workout plan</p>
          <p className="mt-2 text-sm text-gray-500">This can take one to two minutes. Please wait.</p>
        </div>
      ) : null}
      <div className="space-y-10 text-center">
        {error ? (
          <p className="mx-auto max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <WorkoutMultiStepForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </>
  );
}
