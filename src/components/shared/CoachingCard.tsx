"use client";

import Link from "next/link";
import type { CoachingAdvice } from "@/shared/types";

function statusLabel(advice: CoachingAdvice) {
  if (advice.plateau || advice.status === "needs_new_plan") return "Change the plan";
  if (advice.status === "watch") return "Watch";
  if (advice.status === "learning") return "Learning you";
  return "On track";
}

export default function CoachingCard({ advice }: { advice: CoachingAdvice }) {
  const dietHref = advice.diet.should_change ? "/diet" : "/diet/plan";
  const workoutHref = advice.workout.should_change ? "/workout" : "/workout/plan";

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Coach</p>
          <h2 className="mt-1 text-lg font-semibold text-[#282828]">{advice.headline}</h2>
        </div>
        {/* <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-[#282828]">
          {statusLabel(advice)}
        </span> */}
      </div>

      {advice.remembered ? (
        <p className="text-sm text-gray-600">We remember: {advice.remembered}</p>
      ) : null}

      {advice.reasons.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
          {advice.reasons.slice(0, 3).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
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
          <Link
            href={dietHref}
            className="mt-4 inline-flex rounded-xl bg-[#282828] px-4 py-2 text-sm font-semibold text-white"
          >
            {advice.diet.should_change ? "Make an updated diet" : "View diet plan"}
          </Link>
        </article>

        <article className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-[#282828]">Workout</h3>
          <p className="mt-2 text-sm leading-6 text-gray-600">{advice.workout.summary}</p>
          <p className="mt-2 text-sm text-gray-600">{advice.workout.action}</p>
          <Link
            href={workoutHref}
            className="mt-4 inline-flex rounded-xl border-2 border-[#282828] bg-white px-4 py-2 text-sm font-semibold text-[#282828]"
          >
            {advice.workout.should_change ? "Make an updated workout" : "View workout plan"}
          </Link>
        </article>
      </div>
    </section>
  );
}
