"use client";

import { useState, useEffect, type ReactNode } from "react";
import PageLoader from "@/components/ui/PageLoader";

export default function PlanGeneratorClient<TForm, TPlan>({
  generate,
  renderForm,
  renderDisplay,
  renderActions,
}: {
  generate: (data: TForm) => Promise<TPlan>;
  renderForm: (props: { onSubmit: (data: TForm) => void; loading: boolean }) => ReactNode;
  renderDisplay: (props: {
    plan: TPlan;
    onNewPlan: () => void;
    onRegenerate: () => void;
    loading: boolean;
  }) => ReactNode;
  renderActions: (props: { formData: TForm; plan: TPlan }) => ReactNode;
}) {
  const [plan, setPlan] = useState<TPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TForm | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  const handleFormSubmit = async (data: TForm) => {
    setLoading(true);
    setFormData(data);
    try {
      const nextPlan = await generate(data);
      setPlan(nextPlan);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPlan = () => {
    setPlan(null);
    setFormData(null);
  };

  const handleRegenerate = async () => {
    if (!formData) return;
    setLoading(true);

    try {
      const nextPlan = await generate(formData);
      setPlan(nextPlan);
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) {
    return <PageLoader />;
  }

  return (
    <>
      {loading ? (
        <PageLoader overlay title="Making your plan" subtitle="This can take one to two minutes. Please wait." />
      ) : plan ? (
        renderDisplay({
          plan,
          onNewPlan: handleNewPlan,
          onRegenerate: handleRegenerate,
          loading,
        })
      ) : (
        <div className="text-center space-y-10">
          {renderForm({ onSubmit: handleFormSubmit, loading })}
        </div>
      )}

      {plan && formData && (
        <div className="fixed bottom-6 left-0 right-0 mx-auto w-fit z-50">
          {renderActions({ formData, plan })}
        </div>
      )}
    </>
  );
}
