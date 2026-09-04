"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { FillX, StepSwap } from "@/components/shared/Motion";
import PageHero, { type HeroPhoto } from "@/components/shared/PageHero";
import { fyte } from "@/shared/lib/ui";

export type PlanFormStep = { title: string; description: string };

export default function PlanFormShell({
  kicker,
  photo,
  currentStep,
  steps,
  planHref,
  planLabel,
  children,
}: {
  kicker: string;
  photo: HeroPhoto;
  currentStep: number;
  steps: PlanFormStep[];
  planHref?: string;
  planLabel?: string;
  children: ReactNode;
}) {
  const step = steps[currentStep] ?? steps[0];
  const pct = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className={fyte.page}>
      <PageHero
        size="sm"
        photo={photo}
        kicker={kicker}
        title={<StepSwap id={currentStep}>{step.title}</StepSwap>}
        subtitle={<StepSwap id={`d-${currentStep}`}>{step.description}</StepSwap>}
        aside={
          <div className="flex items-center gap-4 lg:flex-col lg:items-end">
            <p className="text-sm font-semibold text-white/80">
              Step {currentStep + 1} of {steps.length}
            </p>
            {planHref && planLabel ? (
              <Link href={planHref} className={fyte.glass}>
                {planLabel} →
              </Link>
            ) : null}
          </div>
        }
      />
      <div className="relative z-10 mx-auto -mt-10 max-w-2xl px-4 pb-20 sm:px-6">
        <div className={`${fyte.card} p-6 sm:p-8`}>
          <div className="mb-8 h-1 overflow-hidden rounded-full bg-fyte-line">
            <FillX pct={pct} className="h-full rounded-full bg-fyte-ink" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
