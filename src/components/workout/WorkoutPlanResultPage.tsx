"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DailyWorkout, Exercise, WorkoutPlanData } from "@/shared/types";
import type { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import { resolveWorkoutPlan, saveWorkoutPlan, beginWorkoutPlanGeneration, beginWorkoutFromLogs } from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import { PlanResultSkeleton } from "@/components/ui/Skeleton";
import PlanPairingCard from "@/components/shared/PlanPairingCard";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";
import { readPendingWorkoutGeneration } from "@frontend/features/workout-plan";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function todayWeekday() {
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as (typeof WEEKDAYS)[number];
}

function calories(value: string | number | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return "-";
  return text.replace(/\s*calories?$/i, "");
}

function isRestDay(day?: DailyWorkout | null) {
  if (!day) return true;
  const title = String(day.day || "").toLowerCase();
  if (title.includes("rest")) return true;
  if (day.difficulty === "rest") return true;
  if (day.muscleGroups?.includes("rest")) return true;
  return !day.exercises?.length;
}

function workoutForDay(plan: WorkoutPlanData, day: (typeof WEEKDAYS)[number]) {
  if (plan.weeklyPlan) return plan.weeklyPlan[day];
  return plan.singleWorkout;
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const alternatives = exercise.alternatives?.filter((item) => item.name) ?? [];

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-[#282828]">{exercise.name}</h3>
      {exercise.muscleGroup ? (
        <p className="mt-1 text-sm capitalize text-gray-500">{exercise.muscleGroup}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">Sets</dt>
          <dd className="mt-1 text-sm font-semibold text-[#282828]">{exercise.sets ?? "-"}</dd>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">Reps</dt>
          <dd className="mt-1 text-sm font-semibold text-[#282828]">{exercise.reps ?? "-"}</dd>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">Rest</dt>
          <dd className="mt-1 text-sm font-semibold text-[#282828]">{exercise.rest || "-"}</dd>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">Load</dt>
          <dd className="mt-1 text-sm font-semibold text-[#282828]">{exercise.weight || "Bodyweight"}</dd>
        </div>
      </dl>

      {exercise.instructions ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#282828]">How to do it</h4>
          <p className="mt-2 text-sm leading-6 text-gray-600">{exercise.instructions}</p>
        </div>
      ) : null}

      {alternatives.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#282828]">You can also do</h4>
          <ul className="mt-2 space-y-2">
            {alternatives.map((item) => (
              <li key={item.name} className="text-sm text-gray-600">
                {item.name}
                {item.description ? `. ${item.description}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function RoutineList({ title, exercises }: { title: string; exercises?: Exercise[] }) {
  if (!exercises?.length) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-[#282828]">{title}</h2>
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <article
            key={`${exercise.name}-${index}`}
            className="rounded-2xl border border-gray-200 bg-white p-5"
          >
            <h3 className="text-base font-semibold text-[#282828]">{exercise.name}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {exercise.sets ? `${exercise.sets} sets` : ""}
              {exercise.reps ? ` · ${exercise.reps}` : ""}
              {exercise.rest ? ` · rest ${exercise.rest}` : ""}
            </p>
            {exercise.instructions ? (
              <p className="mt-2 text-sm leading-6 text-gray-600">{exercise.instructions}</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function WorkoutPlanResultPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [formData, setFormData] = useState<WorkoutPlanFormData | null>(null);
  const [plan, setPlan] = useState<WorkoutPlanData | null>(null);
  const [selectedDay, setSelectedDay] = useState<(typeof WEEKDAYS)[number]>(todayWeekday());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [otherExists, setOtherExists] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    setError("");
    resolveWorkoutPlan(user?.id).then((result) => {
      if (cancelled) return;
      if (result.status === "ready") {
        setFormData(result.session.formData);
        setPlan(result.session.plan);
        setOtherExists(Boolean(readGeneratedDietPlan()));
        return;
      }
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      router.replace("/workout");
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user?.id, retryKey, router]);

  const showWeek = Boolean(plan?.weeklyPlan);
  const currentWorkout = useMemo(() => {
    if (!plan) return null;
    return workoutForDay(plan, selectedDay) || null;
  }, [plan, selectedDay]);

  const handleSave = async () => {
    if (!user || !formData || !plan) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await saveWorkoutPlan(user.id, formData, plan);
      setSaveMessage("Plan saved.");
    } catch {
      setSaveMessage("Could not save the plan. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <PageBreadcrumb
            items={[
              { label: "Home" },
              { label: "Workout Plan", href: "/workout" },
              { label: "Your workout" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900">Could not make your workout plan</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const pending = readPendingWorkoutGeneration();
                if (pending?.fromLogs) beginWorkoutFromLogs();
                else if (pending?.formData) beginWorkoutPlanGeneration(pending.formData);
                setError("");
                setRetryKey((value) => value + 1);
              }}
              className="inline-flex rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href={readPendingWorkoutGeneration()?.fromLogs ? "/progress" : "/workout"}
              className="inline-flex rounded-xl border border-[#282828] px-5 py-3 text-sm font-semibold text-[#282828]"
            >
              {readPendingWorkoutGeneration()?.fromLogs ? "Back to tracking" : "Edit details"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) {
    return <PlanResultSkeleton />;
  }

  const rest = isRestDay(currentWorkout);
  const sessionCalories = currentWorkout?.estimatedCalories || plan.estimatedCaloriesBurn;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          items={[
            { label: "Home" },
            { label: "Workout Plan", href: "/workout" },
            { label: "Your workout" },
          ]}
        />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your workout plan</h1>
          <p className="mt-2 text-gray-600">
            Do these sessions. Then make a matching diet so calories follow the work.
          </p>
        </header>

        <PlanPairingCard
          context="workout-result"
          otherExists={otherExists}
          goal={formData?.goal}
        />

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#282828]">This session</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Calories</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">{calories(sessionCalories)}</dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Duration</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">
                {rest ? "Rest" : currentWorkout?.duration || formData?.workoutDuration || "-"}
              </dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Days per week</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">
                {formData?.workoutFrequency || "-"}
              </dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Rest days</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">
                {plan.recommendedRestDays?.length || 0}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#282828]">What to train</h2>
            {showWeek ? (
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${
                      selectedDay === day
                        ? "bg-[#282828] text-white"
                        : "border border-gray-200 bg-white text-[#282828]"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {rest || !currentWorkout ? (
            <article className="rounded-2xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-[#282828]">Rest day</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Recover so the next session is useful. Walk, sleep, and eat enough protein.
              </p>
            </article>
          ) : (
            <>
              {currentWorkout.muscleGroups?.length ? (
                <p className="mb-4 text-sm text-gray-600">
                  Focus: {currentWorkout.muscleGroups.join(", ")}
                  {currentWorkout.difficulty ? ` · ${currentWorkout.difficulty}` : ""}
                </p>
              ) : null}
              <div className="space-y-4">
                {currentWorkout.exercises.map((exercise, index) => (
                  <ExerciseCard key={`${exercise.name}-${index}`} exercise={exercise} />
                ))}
              </div>
            </>
          )}
        </section>

        <RoutineList title="Warm up" exercises={plan.warmupRoutine} />
        <RoutineList title="Cool down" exercises={plan.cooldownRoutine} />

        {plan.workoutTips?.length ? (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-[#282828]">Tips</h2>
            <ol className="list-decimal space-y-3 rounded-2xl border border-gray-200 bg-white p-5 pl-8 sm:p-6 sm:pl-9">
              {plan.workoutTips.map((tip, index) => (
                <li key={`${index}-${tip}`} className="text-sm leading-6 text-gray-700">
                  {tip}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save this plan"}
          </button>
          <Link
            href="/workout"
            className="rounded-xl border border-[#282828] px-5 py-3 text-sm font-semibold text-[#282828]"
          >
            Make a new plan
          </Link>
          {saveMessage ? <p className="text-sm text-gray-600">{saveMessage}</p> : null}
        </div>
      </div>
    </div>
  );
}
