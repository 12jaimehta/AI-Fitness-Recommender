// components/shared/FormNavigation.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  loading,
  isLastStep,
  submitLabel = "Generate AI Diet Plan",
  loadingLabel = "Please wait...",
}: FormNavigationProps) {
  return (
    <motion.div
      className="flex justify-between gap-4 mt-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {currentStep !== 0 && <MotionButton
        type="button"
        variant="secondary"
        onClick={onPrevious}
        disabled={currentStep === 0}
        className="flex-1 relative"
      >
        Previous
      </MotionButton>}

      <AnimatePresence mode="wait">
        {isLastStep ? (
          <motion.div
            key="submit"
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <MotionButton
              type="button"
              onClick={() => {
                if (loading) return;
                onSubmit();
              }}
              loading={loading}
              className="relative overflow-hidden bg-[#282828] hover:bg-[#454545] text-white shadow-md"
            >
              {!loading && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                  animate={{ x: ["-120%", "120%"] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 2 }}
                />
              )}

              {loading ? (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 size={20} />
                  </motion.div>
                  {loadingLabel}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                  </motion.div>

                  {submitLabel} 
                </div>
              )}
            </MotionButton>
          </motion.div>
        ) : (
          <motion.div
            key="next"
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <MotionButton
              type="button"
              variant="primary"
              onClick={onNext}
              className="relative overflow-hidden bg-[#282828] hover:bg-[#454545]"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"
                animate={{ x: ["-120%", "120%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              />

              Next Step
            </MotionButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
