"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Apple, Check, Dumbbell } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import {
  aiLogMeal,
  aiLogWorkout,
  getDailyProgress,
  getProgressAnalytics,
  getWeeklyReview,
  quickCheckMeal,
  quickCheckWorkout,
  saveVitals,
  saveWorkoutLog,
} from "@/lib/service/progress-database";
import { emptySetsForExercise } from "@/shared/lib/current-plans";
import { localIsoDate } from "@/shared/lib/plan-tracking";
import type {
  CurrentPlanExercise,
  DailyProgress,
  ExerciseLogEntry,
  ProgressAnalytics,
  TrackKind,
  WeeklyReview,
} from "@/shared/types";
import InlineLoader from "@/components/shared/InlineLoader";
import SurfaceCard from "@/components/shared/SurfaceCard";
import TrendChart from "@/components/shared/TrendChart";
import MacroRings from "@/components/progress/MacroRings";
import QuickVitals from "@/components/progress/QuickVitals";
import PlannedMealChecklist from "@/components/progress/PlannedMealChecklist";
import AIMealLogModal from "@/components/progress/AIMealLogModal";
import AIWorkoutLogModal from "@/components/progress/AIWorkoutLogModal";
import ExerciseSetLogger from "@/components/progress/ExerciseSetLogger";

const RANGE_OPTIONS = [
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "last_year", label: "Last year" },
];

function mergeExercises(planExercises: CurrentPlanExercise[], logged: ExerciseLogEntry[]) {
  const byId = new Map(logged.map((item) => [item.exercise_id, item]));
  const fromPlan: ExerciseLogEntry[] = planExercises.map((exercise) => {
    const existing = byId.get(exercise.exercise_id);
    if (existing) return existing;
    return {
      exercise_id: exercise.exercise_id,
      exercise_name: exercise.name,
      target_sets: exercise.target_sets,
      target_reps: exercise.target_reps,
      muscle_group: exercise.muscle_group,
      sets: emptySetsForExercise(exercise),
    };
  });
  const extras = logged.filter((item) => !planExercises.some((exercise) => exercise.exercise_id === item.exercise_id));
  return [...fromPlan, ...extras];
}

export default function ProgressClientPage() {
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const [date, setDate] = useState(localIsoDate());
  const [track, setTrack] = useState<TrackKind>("diet");
  const [range, setRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [daily, setDaily] = useState<DailyProgress | null>(null);
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [aiSlot, setAiSlot] = useState<string | null>(null);
  const [aiWorkout, setAiWorkout] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [dailyData, analyticsData, reviewData] = await Promise.all([
        getDailyProgress(date),
        getProgressAnalytics(range),
        getWeeklyReview().catch(() => null),
      ]);
      setDaily(dailyData);
      setAnalytics(analyticsData);
      setReview(reviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tracking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading || !isSignedIn || !user) return;
    void load();
  }, [user, isSignedIn, userLoading, date, range]);

  const planExercises = daily?.workout_plan?.today_workout.exercises || [];
  const exercises = useMemo(
    () => mergeExercises(planExercises, daily?.actuals.workout_log?.exercises_completed || []),
    [daily, planExercises]
  );
  const activeExercise = exercises.find((item) => item.exercise_id === activeExerciseId) || null;

  const persistExercises = async (next: ExerciseLogEntry[]) => {
    await saveWorkoutLog({
      date,
      exercises_completed: next,
      title: daily?.workout_plan?.today_workout.focus_area,
      is_completed: daily?.actuals.workout_completed,
    });
    await load(true);
  };

  const openExercise = async (exercise: ExerciseLogEntry) => {
    if (!daily?.actuals.workout_log) {
      await persistExercises(exercises);
    }
    setActiveExerciseId(exercise.exercise_id);
  };

  const updateExercise = async (next: ExerciseLogEntry) => {
    const nextList = exercises.map((item) => (item.exercise_id === next.exercise_id ? next : item));
    setDaily((prev) =>
      prev
        ? {
            ...prev,
            actuals: {
              ...prev.actuals,
              workout_log: prev.actuals.workout_log
                ? { ...prev.actuals.workout_log, exercises_completed: nextList }
                : prev.actuals.workout_log,
            },
          }
        : prev
    );
    await persistExercises(nextList);
  };

  const addCustomExercise = async () => {
    const name = window.prompt("Exercise name");
    if (!name?.trim()) return;
    const id = `custom-${Date.now()}`;
    const next: ExerciseLogEntry = {
      exercise_id: id,
      exercise_name: name.trim(),
      target_sets: 3,
      target_reps: "8-12",
      muscle_group: "",
      sets: [
        { id: `${id}-1`, kind: "working", weight_kg: 0, reps: 0 },
        { id: `${id}-2`, kind: "working", weight_kg: 0, reps: 0 },
        { id: `${id}-3`, kind: "working", weight_kg: 0, reps: 0 },
      ],
    };
    await persistExercises([...exercises, next]);
    setActiveExerciseId(id);
  };

  if (userLoading || (loading && !daily)) {
    return <InlineLoader title="Loading tracking..." />;
  }

  if (activeExercise) {
    return (
      <ExerciseSetLogger
        exercise={activeExercise}
        sessionExercises={exercises}
        sessionTitle={daily?.targets.workout_focus || "Workout"}
        onChange={(next) => void updateExercise(next)}
        onBack={() => setActiveExerciseId(null)}
        onAddExercise={() => void addCustomExercise()}
      />
    );
  }

  const periodLabel = RANGE_OPTIONS.find((option) => option.value === range)?.label || "This month";
  const chartPoints =
    track === "diet"
      ? (analytics?.points || []).map((point) => ({ label: point.label, value: point.calories }))
      : (analytics?.points || []).map((point) => ({ label: point.label, value: point.workout ? 1 : 0 }));

  const mealSlotLabel =
    daily?.diet_plan?.meals.find((meal) => meal.slot === aiSlot)?.meal_name || "Meal";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 lg:py-12">
        <header className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Tracking</h1>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-3 rounded-xl border-2 border-[#282828]/15 bg-white px-3 py-2 text-sm font-semibold text-[#282828]"
          />
        </header>

        {error && (
          <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
        )}

        <QuickVitals
          weight={daily?.actuals.weight_kg ?? null}
          water={daily?.actuals.water_intake_ml || 0}
          sleep={daily?.actuals.sleep_hours ?? null}
          onWater={() => void saveVitals({ date, water_increment_ml: 250 }).then(() => load(true))}
          onSave={(patch) => void saveVitals({ date, ...patch }).then(() => load(true))}
        />

        <div className="grid grid-cols-2 gap-3 my-6">
          <button
            type="button"
            onClick={() => setTrack("diet")}
            className={`rounded-2xl p-5 text-left border-2 transition ${
              track === "diet" ? "bg-[#282828] text-white border-[#282828]" : "bg-white text-[#282828] border-[#282828]/15"
            }`}
          >
            <Apple size={22} />
            <p className="mt-3 text-sm font-medium opacity-80">Track diet</p>
            <p className="text-2xl font-bold mt-1">
              {daily?.diet_plan
                ? `${daily.actuals.meals_logged.filter((m) => m.source_type === "plan_checkoff").length}/${daily.diet_plan.meals.length}`
                : "—"}
            </p>
            <p className="text-xs opacity-70 mt-1">meals today</p>
          </button>
          <button
            type="button"
            onClick={() => setTrack("workout")}
            className={`rounded-2xl p-5 text-left border-2 transition ${
              track === "workout" ? "bg-[#282828] text-white border-[#282828]" : "bg-white text-[#282828] border-[#282828]/15"
            }`}
          >
            <Dumbbell size={22} />
            <p className="mt-3 text-sm font-medium opacity-80">Track workout</p>
            <p className="text-2xl font-bold mt-1">
              {daily?.workout_plan?.today_workout.is_rest_day
                ? "Rest"
                : daily?.actuals.workout_completed
                  ? "Done"
                  : daily?.targets.workout_focus || "—"}
            </p>
            <p className="text-xs opacity-70 mt-1">today</p>
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-[#282828]">{periodLabel}</p>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="rounded-xl border-2 border-[#282828]/20 bg-white px-3 py-2 text-sm font-semibold text-[#282828] outline-none"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <SurfaceCard className="mb-4">
          {track === "diet" ? (
            <>
              <MacroRings
                calories={daily?.actuals.total_calories || 0}
                calorieTarget={daily?.targets.calories || 0}
                protein={daily?.actuals.total_protein_g || 0}
                proteinTarget={daily?.targets.protein_g || 0}
                water={daily?.actuals.water_intake_ml || 0}
                waterTarget={daily?.targets.water_ml || 3000}
              />
              <TrendChart points={chartPoints} />
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Sessions</p>
              <p className="text-4xl font-extrabold text-[#282828] mt-1 mb-4">
                {analytics?.summary.total_workouts_completed ?? 0}
                <span className="text-sm font-medium text-slate-400 ml-2">{periodLabel.toLowerCase()}</span>
              </p>
              <TrendChart points={chartPoints} unit="sessions" />
            </>
          )}
        </SurfaceCard>

        {track === "diet" ? (
          <PlannedMealChecklist
            plan={daily?.diet_plan || null}
            logs={daily?.actuals.meals_logged || []}
            busy={busy}
            onCheck={async (slot) => {
              setBusy(slot);
              try {
                await quickCheckMeal(slot, date);
                await load(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not log meal.");
              } finally {
                setBusy("");
              }
            }}
            onAiLog={setAiSlot}
          />
        ) : (
          <WorkoutPanel
            daily={daily}
            exercises={exercises}
            busy={busy}
            onComplete={async () => {
              setBusy("workout");
              try {
                await quickCheckWorkout({}, date);
                await load(true);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not log workout.");
              } finally {
                setBusy("");
              }
            }}
            onOpenExercise={(item) => void openExercise(item)}
            onAi={() => setAiWorkout(true)}
          />
        )}

        {review && (
          <SurfaceCard className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Weekly coach</p>
            <p className="font-bold text-[#282828]">{review.ai_headline}</p>
            <p className="text-sm text-slate-600 mt-2">{review.insights[0]}</p>
          </SurfaceCard>
        )}
      </div>

      <AIMealLogModal
        isOpen={Boolean(aiSlot)}
        slotLabel={mealSlotLabel}
        onClose={() => setAiSlot(null)}
        onSubmit={async (text) => {
          await aiLogMeal(text, aiSlot || "other", date);
          await load(true);
        }}
      />
      <AIWorkoutLogModal
        isOpen={aiWorkout}
        onClose={() => setAiWorkout(false)}
        onSubmit={async (text) => {
          await aiLogWorkout(text, date);
          await load(true);
        }}
      />
    </div>
  );
}

function WorkoutPanel({
  daily,
  exercises,
  busy,
  onComplete,
  onOpenExercise,
  onAi,
}: {
  daily: DailyProgress | null;
  exercises: ExerciseLogEntry[];
  busy: string;
  onComplete: () => void;
  onOpenExercise: (exercise: ExerciseLogEntry) => void;
  onAi: () => void;
}) {
  const plan = daily?.workout_plan;
  if (!plan) {
    return (
      <SurfaceCard>
        <p className="font-bold text-[#282828]">No workout plan yet</p>
        <p className="text-sm text-slate-500 mt-2">Generate a workout plan. Tracking uses those exercises and sets.</p>
        <Link
          href="/workout"
          className="mt-4 inline-flex w-full items-center justify-center py-3 rounded-2xl bg-[#282828] text-white font-semibold"
        >
          Create workout plan
        </Link>
      </SurfaceCard>
    );
  }

  const today = plan.today_workout;
  if (today.is_rest_day) {
    return (
      <SurfaceCard>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today</p>
        <p className="text-2xl font-bold text-[#282828] mt-1">Rest day</p>
        <p className="text-sm text-slate-500 mt-2">Recover. Log something else if you still trained.</p>
        <button type="button" onClick={onAi} className="mt-4 w-full py-3 rounded-2xl border-2 border-[#282828] font-semibold">
          Log another workout
        </button>
      </SurfaceCard>
    );
  }

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today</p>
        <p className="text-2xl font-bold text-[#282828] mt-1">{today.focus_area}</p>
        <p className="text-sm text-slate-500 mt-1">
          {today.estimated_duration_min} min · {today.estimated_calories} kcal · {today.exercises.length} exercises
        </p>
        <button
          type="button"
          onClick={onComplete}
          disabled={busy === "workout"}
          className="w-full mt-4 py-3 rounded-2xl bg-[#282828] text-white font-semibold disabled:opacity-60"
        >
          {daily?.actuals.workout_completed ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <Check size={16} /> Completed · tap to undo
            </span>
          ) : (
            "Workout complete"
          )}
        </button>
      </SurfaceCard>

      <SurfaceCard>
        <p className="text-sm font-semibold text-[#282828] mb-3">Exercises</p>
        <div className="space-y-2">
          {exercises.map((exercise) => {
            const done = exercise.sets.filter((set) => set.kind !== "warmup" && set.reps > 0).length;
            return (
              <button
                key={exercise.exercise_id}
                type="button"
                onClick={() => onOpenExercise(exercise)}
                className="w-full rounded-2xl border-2 border-[#282828]/15 px-4 py-3 text-left"
              >
                <p className="font-semibold text-[#282828]">{exercise.exercise_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {done}/{exercise.target_sets} sets · {exercise.target_reps} reps
                </p>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onAi} className="mt-4 w-full py-3 rounded-2xl border-2 border-[#282828] text-sm font-semibold">
          Log another workout
        </button>
      </SurfaceCard>
    </div>
  );
}
