"use client";

import { FadeIn } from "@/components/shared/Motion";
import MotionButton from "@/components/ui/MotionButton";
import { fyte } from "@/shared/lib/ui";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  loading: boolean;
  isLastStep: boolean;
  submitLabel?: string;
  loadingLabel?: string;
}

export default function FormNavigation({
  currentStep,
  onPrevious,
  onNext,
  onSubmit,
  loading,
  isLastStep,
  submitLabel = "Make my plan",
  loadingLabel = "Making it…",
}: FormNavigationProps) {
  return (
    <FadeIn delay={0.06} className="mt-10 flex items-center justify-between gap-4">
      {currentStep > 0 ? (
        <button type="button" onClick={onPrevious} className={fyte.ghost}>
          Back
        </button>
      ) : (
        <span />
      )}
      <MotionButton
        type="button"
        loading={loading}
        onClick={() => {
          if (loading) return;
          if (isLastStep) onSubmit();
          else onNext();
        }}
        className="w-auto min-w-[10rem] px-6"
      >
        {isLastStep ? (loading ? loadingLabel : submitLabel) : "Continue"}
      </MotionButton>
    </FadeIn>
  );
}
