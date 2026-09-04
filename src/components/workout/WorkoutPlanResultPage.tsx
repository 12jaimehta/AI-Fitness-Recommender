"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DailyWorkout, Exercise, WorkoutPlanData } from "@/shared/types";
import type { WorkoutPlanFormData } from "@/lib/validation/workoutPlanSchema";
import {
  resolveWorkoutPlan,
  saveWorkoutPlan,
  beginWorkoutPlanGeneration,
  beginWorkoutFromLogs,
} from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { PlanResultSkeleton } from "@/components/ui/Skeleton";
import PageHero from "@/components/shared/PageHero";
import AiThoughtStream from "@/components/shared/AiThoughtStream";
import { delay, FadeIn } from "@/components/shared/Motion";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";
import {
  readPendingWorkoutGeneration,
  subscribeWorkoutThoughts,
  readWorkoutThoughts,
} from "@frontend/features/workout-plan";
import { coerceProgramGoal, programGoalLabel } from "@/shared/lib/program-goals";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function todayWeekday() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as (typeof WEEKDAYS)[number];
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

function ExerciseCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const alternatives = exercise.alternatives?.filter((item) => item.name) ?? [];
  const [open, setOpen] = useState(false);

  return (
    <FadeIn delay={delay(index)}>
      <article className={cn(fyte.card, fyte.cardHover)}>
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fyte-ink text-sm font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-bold leading-snug text-fyte-ink">{exercise.name}</h3>
              {exercise.muscleGroup ? (
                <p className="text-xs font-semibold uppercase tracking-wide text-fyte-muted">{exercise.muscleGroup}</p>
              ) : null}
            </div>
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {[
                ["Sets", exercise.sets ?? "-"],
                ["Reps", exercise.reps ?? "-"],
                ["Rest", exercise.rest || "-"],
                ["Load", exercise.weight || "Bodyweight"],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-baseline gap-1.5">
                  <dt className="text-fyte-muted">{label}</dt>
                  <dd className="font-semibold text-fyte-ink">{value}</dd>
                </div>
              ))}
            </dl>
            {exercise.instructions || alternatives.length ? (
              <>
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="mt-3 text-sm font-semibold text-fyte-ink underline-offset-4 hover:underline"
                >
                  {open ? "Hide" : "How to do it"}
                </button>
                {open ? (
                  <div className="mt-3 grid gap-4 border-t border-fyte-line pt-4 sm:grid-cols-2">
                    {exercise.instructions ? (
                      <p className="text-sm leading-6 text-fyte-muted">{exercise.instructions}</p>
                    ) : null}
                    {alternatives.length ? (
                      <div>
                        <h4 className="text-sm font-semibold text-fyte-ink">Swap for</h4>
                        <ul className="mt-2 space-y-1.5">
                          {alternatives.map((item) => (
                            <li key={item.name} className="text-sm leading-6 text-fyte-muted">
                              <span className="font-medium text-fyte-ink">{item.name}</span>
                              {item.description ? ` — ${item.description}` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </article>
    </FadeIn>
  );
}

function RoutineList({ title, exercises }: { title: string; exercises?: Exercise[] }) {
  if (!exercises?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-xl font-bold text-fyte-ink">{title}</h2>
      <ul className={cn(fyte.card, "divide-y divide-fyte-line p-0 sm:p-0")}>
        {exercises.map((exercise, index) => (
          <li key={`${exercise.name}-${index}`} className="flex flex-wrap items-baseline justify-between gap-2 px-5 py-3.5">
            <p className="font-semibold text-fyte-ink">{exercise.name}</p>
            <p className="text-sm text-fyte-muted">
              {[exercise.sets ? `${exercise.sets} sets` : "", exercise.reps ? String(exercise.reps) : "", exercise.duration || ""]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </li>
        ))}
      </ul>
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
  const [thoughts, setThoughts] = useState(readWorkoutThoughts);

  useEffect(() => subscribeWorkoutThoughts(setThoughts), []);

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
      setSaveMessage("Saved. The coach will use this plan.");
    } catch {
      setSaveMessage("Could not save the plan. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    const pending = readPendingWorkoutGeneration();
    return (
      <div className={fyte.page}>
        <PageHero
          photo="workout"
          kicker="Workout plan"
          title="Could not make your workout plan"
          subtitle={error}
          actions={
            <>
              <button
                type="button"
                className={fyte.glassSolid}
                onClick={() => {
                  if (pending?.fromLogs) beginWorkoutFromLogs();
                  else if (pending?.formData) beginWorkoutPlanGeneration(pending.formData);
                  setError("");
                  setRetryKey((value) => value + 1);
                }}
              >
                Try again
              </button>
              <Link href={pending?.fromLogs ? "/progress" : "/workout"} className={fyte.glass}>
                {pending?.fromLogs ? "Back to coach" : "Edit details"}
              </Link>
            </>
          }
        />
      </div>
    );
  }

  if (!plan) {
    const pending = readPendingWorkoutGeneration();
    if (pending?.formData || pending?.fromLogs || thoughts.length) {
      return (
        <AiThoughtStream
          photo="workout"
          kicker="Workout plan"
          title="Writing your sessions"
          subtitle="The coach is thinking through your week, then locking the work."
          thoughts={thoughts}
        />
      );
    }
    return <PlanResultSkeleton />;
  }

  const rest = isRestDay(currentWorkout);
  const sessionCalories = currentWorkout?.estimatedCalories || plan.estimatedCaloriesBurn;
  const goal = coerceProgramGoal(formData?.goal) ? programGoalLabel(formData?.goal) : "";
  const trainingDays = plan.weeklyPlan
    ? WEEKDAYS.filter((day) => !isRestDay(plan.weeklyPlan?.[day])).length
    : Number(formData?.workoutFrequency) || 0;

  return (
    <div className={fyte.page}>
      <PageHero
        photo="workout"
        kicker={goal ? `Workout plan · ${goal}` : "Workout plan"}
        title="Your training week"
        subtitle="Show up, do the work, tell the coach how it felt. It adjusts from there."
        actions={
          <>
            <button type="button" onClick={handleSave} disabled={saving} className={fyte.glassSolid}>
              {saving ? "Saving…" : "Save this plan"}
            </button>
            <Link href={otherExists ? "/diet/plan" : "/diet"} className={fyte.glass}>
              {otherExists ? "See matching diet" : "Make a matching diet"}
            </Link>
            <Link href="/workout" className={fyte.glass}>
              New plan
            </Link>
          </>
        }
        aside={
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[26rem]">
            {[
              ["Days / week", trainingDays || "-"],
              ["Per session", currentWorkout?.duration || (formData?.workoutDuration ? `${formData.workoutDuration} min` : "-")],
              ["Burn", calories(sessionCalories)],
              ["Rest days", plan.recommendedRestDays?.length || 7 - trainingDays],
            ].map(([label, value]) => (
              <div key={String(label)} className={fyte.stat}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</dt>
                <dd className="mt-1 text-sm font-extrabold break-words">{value}</dd>
              </div>
            ))}
          </dl>
        }
      />

      <div className={fyte.content}>
        {saveMessage ? (
          <p className="mb-4 rounded-xl bg-fyte-ink px-4 py-3 text-sm font-medium text-white shadow-card">{saveMessage}</p>
        ) : null}

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold capitalize text-fyte-ink">
                {showWeek ? selectedDay : "Your session"}
                {rest ? " · Rest" : ""}
              </h2>
              {!rest && currentWorkout?.muscleGroups?.length ? (
                <p className="mt-1 text-sm text-fyte-muted">
                  {currentWorkout.muscleGroups.join(", ")}
                  {currentWorkout.difficulty ? ` · ${currentWorkout.difficulty}` : ""}
                </p>
              ) : null}
            </div>
            {showWeek ? (
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => {
                  const dayRest = isRestDay(plan.weeklyPlan?.[day]);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition",
                        selectedDay === day
                          ? "bg-fyte-ink text-white"
                          : dayRest
                            ? "border border-dashed border-fyte-line bg-transparent text-fyte-muted hover:border-fyte-ink"
                            : "border border-fyte-line bg-fyte-card text-fyte-ink hover:border-fyte-ink"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {rest || !currentWorkout ? (
            <article className={cn(fyte.card, "flex flex-col items-start gap-2 py-10 text-left sm:items-center sm:text-center")}>
              <p className={fyte.kicker}>Rest day</p>
              <h3 className="text-2xl font-bold text-fyte-ink">Recovery is part of the program.</h3>
              <p className="max-w-md text-sm leading-6 text-fyte-muted">
                Walk, sleep, and hit your protein. Tomorrow&apos;s session depends on it.
              </p>
            </article>
          ) : (
            <div className="space-y-3">
              {currentWorkout.exercises.map((exercise, index) => (
                <ExerciseCard key={`${selectedDay}-${exercise.name}-${index}`} exercise={exercise} index={index} />
              ))}
            </div>
          )}
        </section>

        <RoutineList title="Warm up" exercises={plan.warmupRoutine} />
        <RoutineList title="Cool down" exercises={plan.cooldownRoutine} />

        {plan.workoutTips?.length ? (
          <section className="mt-12 rounded-2xl bg-fyte-ink p-6 text-white shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Train smart</p>
            <ol className="mt-4 grid gap-4 sm:grid-cols-2">
              {plan.workoutTips.map((tip, index) => (
                <li key={`${index}-${tip}`} className="flex gap-3 text-sm leading-6 text-white/85">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}
