"use client";

import Link from "next/link";
import { programGoalLabel } from "@/shared/lib/program-goals";

export default function PlanPairingCard({
  context,
  otherExists,
  goal,
}: {
  context: "workout-form" | "diet-form" | "workout-result" | "diet-result";
  otherExists: boolean;
  goal?: string | null;
}) {
  const label = programGoalLabel(goal);

  if (context === "workout-form") {
    return (
      <aside className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-left">
        <h2 className="text-base font-semibold text-[#282828]">Training first</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Calories and carbs should follow how you train. Hyrox, Ironman, bodybuilding, and fat
          loss all need different food. Make this workout, then make a matching diet.
        </p>
      </aside>
    );
  }

  if (context === "diet-form" && otherExists) {
    return (
      <aside className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-left">
        <h2 className="text-base font-semibold text-[#282828]">Matching your {label} workout</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          We will set calories and carbs for that training. You can still change food preference and meals.
        </p>
      </aside>
    );
  }

  if (context === "diet-form") {
    return (
      <aside className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 text-left">
        <h2 className="text-base font-semibold text-[#282828]">Food works better with training</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          A workout first tells us how much to eat. You can make a diet now, then add a workout so both stay in sync.
        </p>
        <Link
          href="/workout"
          className="mt-4 inline-flex rounded-xl border-2 border-[#282828] px-4 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white"
        >
          Make a workout first
        </Link>
      </aside>
    );
  }

  if (context === "workout-result") {
    return (
      <aside className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 text-left">
        <h2 className="text-base font-semibold text-[#282828]">
          {otherExists ? `Diet is set for ${label}` : `Fuel this ${label} plan`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {otherExists
            ? "Open your diet if you want meals that match these sessions."
            : "This plan needs food that matches the work. Make a diet next so calories and carbs fit."}
        </p>
        <Link
          href={otherExists ? "/diet/plan" : "/diet"}
          className="mt-4 inline-flex rounded-xl bg-[#282828] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#454545]"
        >
          {otherExists ? "View matching diet" : "Make a matching diet"}
        </Link>
      </aside>
    );
  }

  return (
    <aside className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 text-left">
      <h2 className="text-base font-semibold text-[#282828]">
        {otherExists ? `Workout is set for ${label}` : `Train for ${label}`}
      </h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        {otherExists
          ? "Log both. Progress works when meals and sessions stay together."
          : "Meals alone are half the plan. Add a workout so this diet has a job."}
      </p>
      <Link
        href={otherExists ? "/workout/plan" : "/workout"}
        className="mt-4 inline-flex rounded-xl bg-[#282828] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#454545]"
      >
        {otherExists ? "View matching workout" : "Make a matching workout"}
      </Link>
    </aside>
  );
}
