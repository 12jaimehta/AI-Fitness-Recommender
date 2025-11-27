"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import dynamic from "next/dynamic";
import { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import PlanActions from "@/components/diet/PlanActions";
import { DietPlanData, generateAIDietPlan } from "@/lib/service/dietWorkoutplan";
import PageLoader from "@/components/ui/PageLoader";

// dynamic imports
const RefactoredMultiStepForm = dynamic(
  () => import("@/components/diet").then(m => ({ default: m.RefactoredMultiStepForm })),
  { ssr: false, loading: () => <PageLoader title="Loading Page ..." /> }
);

const RefactoredDietPlanDisplay = dynamic(
  () => import("@/components/diet").then(m => ({ default: m.RefactoredDietPlanDisplay })),
  { ssr: false, loading: () => <PageLoader title="Loading Page ..." /> }
);

export default function DietClientPage() {
  const [dietPlan, setDietPlan] = useState<DietPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DietPlanFormData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleFormSubmit = async (data: DietPlanFormData) => {
    setLoading(true);
    setFormData(data);
    try {
      const plan = await generateAIDietPlan(data);
      setDietPlan(plan);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setDietPlan(null);
    setFormData(null);
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    setLoading(true);

    try {
      const plan = await generateAIDietPlan(formData);
      setDietPlan(plan);
    } finally {
      setLoading(false);
    }
  };

  // initial skeleton while client mounts
  if (!isClient) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center pt-20">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Activity size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <PageLoader title="Loading ..." />
      ) : dietPlan ? (
        <RefactoredDietPlanDisplay
          dietPlan={dietPlan}
          onNewPlan={handleNewPlan}
          onRegenerate={handleRegenerate}
          loading={loading}
        />
      ) : (
        <div className="text-center space-y-10">
          <RefactoredMultiStepForm onSubmit={handleFormSubmit} loading={loading} />
        </div>
      )}

      {dietPlan && formData && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-50">
          <PlanActions formData={formData} dietPlan={dietPlan} />
        </div>
      )}
    </>
  );
}
