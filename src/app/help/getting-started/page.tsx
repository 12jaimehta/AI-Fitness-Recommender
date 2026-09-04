"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import DocShell, { DocCta } from "@/components/docs/DocShell";
import { FadeInView } from "@/components/shared/Motion";
import { features, steps } from "@/content/getting-started";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

export default function GettingStarted() {
  return (
    <DocShell
      kicker="Help"
      title="From sign-up to your first coached week"
      subtitle="Four steps. About ten minutes. After that the coach does the remembering."
      photo="coach"
      actions={
        <Link href="/sign-up" className={fyte.glassSolid}>
          Create an account
        </Link>
      }
    >
      <ol className="space-y-4">
        {steps.map((step, index) => (
          <FadeInView key={step.title} delay={index * 0.04}>
            <li className={cn(fyte.card, "grid gap-5 sm:grid-cols-[3.5rem_1fr]")}>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fyte-ink text-xl font-extrabold text-white">
                {step.number}
              </span>
              <div>
                <h2 className="text-xl font-bold text-fyte-ink">{step.title}</h2>
                <p className="mt-2 text-sm leading-7 text-fyte-muted">{step.description}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                  {step.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2 rounded-xl bg-fyte-panel px-3 py-2 text-sm text-fyte-ink">
                      <Check size={16} className="mt-0.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          </FadeInView>
        ))}
      </ol>

      <section className="mt-14">
        <h2 className="text-2xl font-bold text-fyte-ink">What you get</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <FadeInView key={feature.title} delay={index * 0.04} className={cn(fyte.card, fyte.cardHover)}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fyte-ink text-white">
                <feature.icon size={18} />
              </span>
              <h3 className="mt-4 font-bold text-fyte-ink">{feature.title}</h3>
              <p className="mt-1 text-sm leading-6 text-fyte-muted">{feature.description}</p>
            </FadeInView>
          ))}
        </div>
      </section>

      <DocCta title="Ready?" body="Make a diet plan first. The workout and the coach follow from it." href="/diet" label="Make my diet" />
    </DocShell>
  );
}
