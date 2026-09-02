"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CoachingAdvice } from "@/shared/types";
import { beginDietFromLogs, beginWorkoutFromLogs } from "@/lib/service/dietWorkoutplan";

const PRIMARY_BTN =
  "mt-4 inline-flex rounded-xl bg-[#282828] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
const SECONDARY_BTN =
  "mt-4 inline-flex rounded-xl border-2 border-[#282828] bg-white px-4 py-2 text-sm font-semibold text-[#282828] disabled:opacity-60";

export default function CoachingCard({
  advice,
  hasDietPlan = false,
  hasWorkoutPlan = false,
}: {
  advice: CoachingAdvice;
  hasDietPlan?: boolean;
  hasWorkoutPlan?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"diet" | "workout" | "">("");

  const goDiet = () => {
    if (advice.diet.should_change && hasDietPlan) {
      setBusy("diet");
      beginDietFromLogs();
      router.push("/diet/plan");
      return;
    }
    router.push(hasDietPlan ? "/diet/plan" : "/diet");
  };

  const goWorkout = () => {
    if (advice.workout.should_change && hasWorkoutPlan) {
      setBusy("workout");
      beginWorkoutFromLogs();
      router.push("/workout/plan");
      return;
    }
    router.push(hasWorkoutPlan ? "/workout/plan" : "/workout");
  };

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</p>
          <h2 className="mt-1 text-lg font-semibold text-[#282828]">{advice.headline}</h2>
        </div>
      </div>

      {advice.remembered ? (
        <p className="text-sm text-gray-600">We remember: {advice.remembered}</p>
      ) : null}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-[#282828]">Diet</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{advice.diet.summary}</p>
          {advice.diet.suggested_calories ? (
            <p className="mt-2 text-sm font-semibold text-[#282828]">
              Aim about {advice.diet.suggested_calories} kcal
              {advice.diet.calorie_change !== "hold" ? ` (${advice.diet.calorie_change})` : ""}
            </p>
          ) : null}
          <p className="mt-2 text-sm text-gray-600">{advice.diet.protein_note}</p>
          {advice.diet.meal_tweaks.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
              {advice.diet.meal_tweaks.map((tweak) => (
                <li key={tweak}>{tweak}</li>
              ))}
            </ul>
          ) : null}
          <button type="button" onClick={goDiet} disabled={busy === "diet"} className={PRIMARY_BTN}>
            {busy === "diet"
              ? "Updating…"
              : advice.diet.should_change && hasDietPlan
                ? "Update diet"
                : hasDietPlan
                  ? "View diet plan"
                  : "Make a diet plan"}
          </button>
        </article>

        <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-[#282828]">Workout</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{advice.workout.summary}</p>
          <p className="mt-2 text-sm text-gray-600">{advice.workout.action}</p>
          <button
            type="button"
            onClick={goWorkout}
            disabled={busy === "workout"}
            className={SECONDARY_BTN}
          >
            {busy === "workout"
              ? "Updating…"
              : advice.workout.should_change && hasWorkoutPlan
                ? "Update workout"
                : hasWorkoutPlan
                  ? "View workout plan"
                  : "Make a workout"}
          </button>
        </article>
      </div>
    </section>
  );
}
