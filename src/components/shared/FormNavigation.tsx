// components/shared/FormNavigation.tsx
"use client";

import { FadeIn, StepSwap } from "@/components/shared/Motion";
import { Loader2 } from "lucide-react";
import MotionButton from "@/components/ui/MotionButton";

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
  submitLabel = "Generate AI Diet Plan",
  loadingLabel = "Please wait...",
}: FormNavigationProps) {
  return (
    <FadeIn delay={0.08} className="flex justify-between gap-4 mt-10">
      {currentStep !== 0 && (
        <MotionButton
          type="button"
          variant="secondary"
          onClick={onPrevious}
          disabled={currentStep === 0}
          className="flex-1 relative"
        >
          Previous
        </MotionButton>
      )}

      <StepSwap id={isLastStep ? "submit" : "next"} className="flex-1">
        {isLastStep ? (
          <MotionButton
            type="button"
            onClick={() => {
              if (loading) return;
              onSubmit();
            }}
            loading={loading}
            className="relative overflow-hidden bg-[#282828] hover:bg-[#454545] text-white shadow-md"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" />
                {loadingLabel}
              </div>
            ) : (
              submitLabel
            )}
          </MotionButton>
        ) : (
          <MotionButton
            type="button"
            variant="primary"
            onClick={onNext}
            className="relative overflow-hidden bg-[#282828] hover:bg-[#454545]"
          >
            Next Step
          </MotionButton>
        )}
      </StepSwap>
    </FadeIn>
  );
}
