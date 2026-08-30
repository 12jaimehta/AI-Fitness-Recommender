"use client";

export default function FormStepHeader({
  currentStep,
  totalSteps,
  title,
  description,
}: {
  currentStep: number;
  totalSteps: number;
  title: string;
  description: string;
}) {
  return (
    <header className="mb-8 flex flex-col gap-2 items-center">
      <p className="text-sm text-slate-500">
        Step {currentStep + 1} of {totalSteps}
      </p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
        {title}
      </h1>
      <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
        {description}
      </p>
    </header>
  );
}
