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
import PageLoader from "@/components/ui/PageLoader";

const WorkoutMultiStepForm = dynamic(
  () => import("@/components/workout").then((m) => ({ default: m.WorkoutMultiStepForm })),
  {
    ssr: false,
    loading: () => <PageLoader />,
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
        <PageLoader
          overlay
          title="Making your workout plan"
          subtitle="This can take one to two minutes. Please wait."
        />
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
