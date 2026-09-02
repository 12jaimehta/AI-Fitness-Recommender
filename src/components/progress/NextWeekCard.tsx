"use client";

import Link from "next/link";
import type { CoachingAdvice } from "@/shared/types";

const CARD = "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const PRIMARY_BTN =
  "inline-flex h-11 min-w-[10.5rem] items-center justify-center whitespace-nowrap rounded-xl bg-[#282828] px-5 text-sm font-semibold text-white disabled:opacity-60 w-full sm:w-auto";
const SECONDARY_BTN =
  "inline-flex h-11 min-w-[10.5rem] items-center justify-center whitespace-nowrap rounded-xl border-2 border-[#282828] bg-white px-5 text-sm font-semibold text-[#282828] disabled:opacity-40 w-full sm:w-auto";
const ACTION_ROW = "mt-4 flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:flex-wrap";

export default function NextWeekCard({
  hasDietPlan,
  hasWorkoutPlan,
  coaching,
  busy,
  onDietFromLogs,
  onWorkoutFromLogs,
}: {
  hasDietPlan: boolean;
  hasWorkoutPlan: boolean;
  coaching: CoachingAdvice | null;
  busy: "diet" | "workout" | "";
  onDietFromLogs: () => void;
  onWorkoutFromLogs: () => void;
}) {
  const stalled = Boolean(coaching?.flags.includes("calorie_stall_14d"));

  return (
    <section className={`${CARD} mb-6`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Our promise</p>
      <h2 className="mt-1 text-lg font-semibold text-[#282828]">
        We adjust calories when your weight stalls for 14 days.
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        {stalled
          ? "Your weight has been still. The next plan will move calories for you."
          : "Log the days you live. When the scale stops moving, the plan will not stay stuck."}
      </p>

      <div className={ACTION_ROW}>
        {hasDietPlan ? (
          <button type="button" onClick={onDietFromLogs} disabled={busy === "diet"} className={PRIMARY_BTN}>
            {busy === "diet" ? "Updating…" : "Update diet"}
          </button>
        ) : (
          <Link href="/diet" className={PRIMARY_BTN}>
            Make a diet plan
          </Link>
        )}
        {hasWorkoutPlan ? (
          <button
            type="button"
            onClick={onWorkoutFromLogs}
            disabled={busy === "workout"}
            className={SECONDARY_BTN}
          >
            {busy === "workout" ? "Updating…" : "Update workout"}
          </button>
        ) : (
          <Link href="/workout" className={SECONDARY_BTN}>
            Make a workout
          </Link>
        )}
      </div>
    </section>
  );
}
