"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Apple, Check, ChevronRight, Dumbbell } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import {
  aiLogMeal,
  aiLogWorkout,
  getDailyProgress,
  getProgressAnalytics,
  getWeeklyReview,
  getCoachingAdvice,
  quickCheckMeal,
  quickCheckWorkout,
  saveVitals,
  saveWorkoutLog,
} from "@/lib/service/progress-database";
import { emptySetsForExercise } from "@/shared/lib/current-plans";
import { localIsoDate } from "@/shared/lib/plan-tracking";
import type {
  CurrentDietPlan,
  CurrentPlanExercise,
  DailyProgress,
  ExerciseLogEntry,
  MealLogRow,
  ProgressAnalytics,
  TrackKind,
  WeeklyReview,
  CoachingAdvice,
} from "@/shared/types";
import PageLoader from "@/components/ui/PageLoader";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import CoachingCard from "@/components/shared/CoachingCard";
import TrendChart from "@/components/shared/TrendChart";
import QuickVitals from "@/components/progress/QuickVitals";
import AIMealLogModal from "@/components/progress/AIMealLogModal";
import AIWorkoutLogModal from "@/components/progress/AIWorkoutLogModal";
import ExerciseSetLogger from "@/components/progress/ExerciseSetLogger";

const RANGE_OPTIONS = [
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];

const CARD = "rounded-2xl border border-gray-200 bg-white p-5 sm:p-6";
const PRIMARY_BTN = "rounded-xl bg-[#282828] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60";
const SECONDARY_BTN =
  "rounded-xl border-2 border-[#282828] bg-white px-4 py-3 text-sm font-semibold text-[#282828] disabled:opacity-40";

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

function FillBar({
  label,
  help,
  value,
  target,
  unit,
}: {
  label: string;
  help: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#282828]">{label}</p>
          <p className="mt-0.5 text-xs text-gray-500">{help}</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#282828]">
          {Math.round(value)} / {target || 0} {unit}
        </p>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          className="h-full rounded-full bg-[#282828]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      </div>
    </div>
  );
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
  const [coaching, setCoaching] = useState<CoachingAdvice | null>(null);
  const [aiSlot, setAiSlot] = useState<string | null>(null);
  const [aiWorkout, setAiWorkout] = useState(false);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const [dailyData, analyticsData, reviewData, coachingData] = await Promise.all([
        getDailyProgress(date),
        getProgressAnalytics(range, date),
        getWeeklyReview().catch(() => null),
        getCoachingAdvice().catch(() => null),
      ]);
      setDaily(dailyData);
      setAnalytics(analyticsData);
      setReview(reviewData);
      setCoaching(coachingData);
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
    return <PageLoader title="Loading tracking..." />;
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

  const mealSlotLabel =
    daily?.diet_plan?.meals.find((meal) => meal.slot === aiSlot)?.meal_name ||
    (aiSlot === "other" ? "this date" : "Meal");
  const mealsLogged = daily?.actuals.meals_logged.filter((meal) => meal.source_type === "plan_checkoff").length || 0;
  const mealsTotal = daily?.diet_plan?.meals.length || 0;
  const dateLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb items={[{ label: "Home" }, { label: "Tracking" }]} />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Tracking</h1>
          <p className="mt-2 text-gray-600">Check in, then tap meals or workout for this day.</p>
        </header>

        {error ? (
          <p className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">{error}</p>
        ) : null}

        <section className={`${CARD} mb-6`}>
          <h2 className="text-lg font-semibold text-[#282828]">Which day?</h2>
          <p className="mt-1 text-sm text-gray-600">Change the date to log another day. Today is the default.</p>
          <label className="mt-4 block max-w-sm">
            <span className="mb-2 block text-sm font-semibold text-[#282828]">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border-2 border-[#282828] bg-white px-4 py-3 text-base font-semibold text-[#282828] outline-none"
            />
          </label>
          <p className="mt-2 text-xs text-gray-500">{dateLabel}</p>
        </section>

        {coaching ? (
          <div className="mb-6">
            <CoachingCard advice={coaching} />
          </div>
        ) : null}

        <QuickVitals
          weight={daily?.actuals.weight_kg ?? null}
          water={daily?.actuals.water_intake_ml || 0}
          sleep={daily?.actuals.sleep_hours ?? null}
          waterTarget={daily?.targets.water_ml || 3000}
          onWater={(deltaMl) => void saveVitals({ date, water_increment_ml: deltaMl }).then(() => load(true))}
          onSave={(patch) => void saveVitals({ date, ...patch }).then(() => load(true))}
        />

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-[#282828]">What are you logging?</h2>
          <p className="mt-1 text-sm text-gray-600">Tap meals or workout. The list below follows what you pick.</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTrack("diet")}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                track === "diet"
                  ? "border-[#282828] bg-[#282828] text-white"
                  : "border-gray-200 bg-white text-[#282828]"
              }`}
            >
              <Apple size={22} />
              <p className="mt-3 text-sm font-medium opacity-80">Meals</p>
              <p className="mt-1 text-2xl font-bold">
                {daily?.diet_plan
                  ? `${mealsLogged}/${mealsTotal}`
                  : daily?.actuals.meals_logged.length
                    ? String(daily.actuals.meals_logged.length)
                    : "—"}
              </p>
              <p className="mt-1 text-xs opacity-70">this day</p>
            </button>
            <button
              type="button"
              onClick={() => setTrack("workout")}
              className={`rounded-2xl border-2 p-5 text-left transition ${
                track === "workout"
                  ? "border-[#282828] bg-[#282828] text-white"
                  : "border-gray-200 bg-white text-[#282828]"
              }`}
            >
              <Dumbbell size={22} />
              <p className="mt-3 text-sm font-medium opacity-80">Workout</p>
              <p className="mt-1 text-2xl font-bold">
                {daily?.actuals.workout_completed
                  ? "Done"
                  : daily?.workout_plan?.today_workout.is_rest_day
                    ? "Rest"
                    : daily?.targets.workout_focus || "—"}
              </p>
              <p className="mt-1 text-xs opacity-70">this day</p>
            </button>
          </div>
        </section>

        <section className={`${CARD} mt-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#282828]">
                {track === "diet" ? "Calories and protein" : "Workouts"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {range === "year"
                  ? "Your daily logs for this year, added up by month."
                  : "Your daily logs for this month, one point per day."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRange(option.value)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                    range === option.value
                      ? "bg-[#282828] text-white"
                      : "border-2 border-[#282828] bg-white text-[#282828]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className={`mt-5 grid grid-cols-2 gap-3 ${track === "diet" ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
            {track === "diet" ? (
              <>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">
                    {Math.round(analytics?.summary.total_calories ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">kcal logged</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">
                    {Math.round(analytics?.summary.total_protein_g ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">g protein</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">
                    {analytics?.summary.diet_days ?? 0}
                    <span className="text-sm font-medium text-gray-500">
                      /{analytics?.summary.days_in_range ?? 0}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">days with meals</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">{analytics?.summary.meals_logged ?? 0}</p>
                  <p className="mt-1 text-xs text-gray-500">meals logged</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">
                    {analytics?.summary.workout_days ?? 0}
                    <span className="text-sm font-medium text-gray-500">
                      /{analytics?.summary.days_in_range ?? 0}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-gray-500">days trained</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <p className="text-2xl font-bold text-[#282828]">
                    {analytics?.summary.total_workouts_completed ?? 0}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">sessions</p>
                </div>
              </>
            )}
          </div>

          <div className="mt-4">
            <TrendChart
              key={`${track}-${range}`}
              kind={track}
              points={analytics?.points || []}
              bucket={analytics?.bucket || "day"}
              metric="macros"
            />
          </div>
        </section>

        <div className="mt-6">
          {track === "diet" ? (
            <DietMealsPanel
              plan={daily?.diet_plan || null}
              logs={daily?.actuals.meals_logged || []}
              calories={daily?.actuals.total_calories || 0}
              calorieTarget={daily?.targets.calories || 0}
              protein={daily?.actuals.total_protein_g || 0}
              proteinTarget={daily?.targets.protein_g || 0}
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
        </div>

        {review ? (
          <section className={`${CARD} mt-6`}>
            <h2 className="text-lg font-semibold text-[#282828]">This week</h2>
            <p className="mt-1 text-sm text-gray-600">A short read of how the last seven days went.</p>
            <p className="mt-4 font-semibold text-[#282828]">{review.ai_headline}</p>
            {review.insights[0] ? <p className="mt-2 text-sm text-gray-600">{review.insights[0]}</p> : null}
          </section>
        ) : null}
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

function DietMealsPanel({
  plan,
  logs,
  calories,
  calorieTarget,
  protein,
  proteinTarget,
  busy,
  onCheck,
  onAiLog,
}: {
  plan: CurrentDietPlan | null;
  logs: MealLogRow[];
  calories: number;
  calorieTarget: number;
  protein: number;
  proteinTarget: number;
  busy: string;
  onCheck: (slot: string) => void;
  onAiLog: (slot: string) => void;
}) {
  if (!plan) {
    return (
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-[#282828]">Meals</h2>
        <p className="mt-1 text-sm text-gray-600">
          Log what you ate for this date. Make a diet plan if you want tap-to-log slots.
        </p>
        {logs.length > 0 ? (
          <div className="mt-4 space-y-2">
            {logs.map((log) => (
              <div key={log.id}>
                <p className="text-sm font-semibold text-[#282828]">{log.meal_name}</p>
                <p className="text-xs text-gray-500">
                  {log.total_calories} kcal · {log.total_protein_g}g protein
                </p>
              </div>
            ))}
            <p className="pt-1 text-sm font-semibold text-[#282828]">
              {Math.round(calories)} kcal · {Math.round(protein)}g protein
            </p>
          </div>
        ) : null}
        <button type="button" onClick={() => onAiLog("other")} className={`${PRIMARY_BTN} mt-4 w-full`}>
          Log a meal
        </button>
        <Link href="/diet" className={`${SECONDARY_BTN} mt-2 inline-flex w-full items-center justify-center`}>
          Make a diet plan
        </Link>
      </section>
    );
  }

  const checkedCount = logs.filter((log) => log.source_type === "plan_checkoff").length;
  const extras = logs.filter((log) => log.source_type !== "plan_checkoff");

  return (
    <section className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#282828]">Meals</h2>
          <p className="mt-1 text-sm text-gray-600">Tap a meal when you eat it. Tap Something else if you swapped it.</p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[#282828]">
          {checkedCount}/{plan.meals.length}
        </p>
      </div>
      <p className="mt-1 text-xs text-gray-500">{plan.plan_name}</p>

      <div className="mt-4 space-y-3">
        <FillBar label="Calories" help="For this date." value={calories} target={calorieTarget} unit="kcal" />
        <FillBar label="Protein" help="For this date." value={protein} target={proteinTarget} unit="g" />
      </div>

      <div className="mt-5 space-y-3">
        {plan.meals.map((meal) => {
          const checked = logs.some((log) => log.meal_slot === meal.slot && log.source_type === "plan_checkoff");
          const item = meal.items[0];
          const saving = busy === meal.slot;
          return (
            <div key={meal.meal_id} className="overflow-hidden rounded-2xl border border-gray-200">
              <button
                type="button"
                onClick={() => onCheck(meal.slot)}
                disabled={saving}
                className={`w-full px-4 py-3 text-left transition disabled:opacity-60 ${
                  checked ? "bg-[#282828] text-white" : "bg-white text-[#282828]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${checked ? "text-white/70" : "text-gray-500"}`}>
                      {meal.meal_name} · {meal.recommended_time}
                    </p>
                    <p className="mt-0.5 truncate font-semibold">{item?.name}</p>
                    <p className={`mt-0.5 text-xs ${checked ? "text-white/70" : "text-gray-500"}`}>
                      {meal.total_meal_calories} kcal · {meal.total_meal_protein}g protein
                    </p>
                  </div>
                  {checked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold">
                      <Check size={16} /> Ate it
                    </span>
                  ) : (
                    <span className="text-xs font-semibold">{saving ? "Saving..." : "Tap to log"}</span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => onAiLog(meal.slot)}
                className="w-full border-t border-gray-200 bg-gray-50 px-4 py-2.5 text-left text-xs font-semibold text-[#282828]"
              >
                Something else
              </button>
            </div>
          );
        })}
      </div>

      {extras.length > 0 ? (
        <div className="mt-5 space-y-2 border-t border-gray-200 pt-4">
          <p className="text-sm font-semibold text-[#282828]">Also logged</p>
          {extras.map((log) => (
            <div key={log.id}>
              <p className="text-sm font-semibold text-[#282828]">{log.meal_name}</p>
              <p className="text-xs text-gray-500">
                {log.total_calories} kcal · {log.total_protein_g}g protein
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
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
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-[#282828]">Workout</h2>
        <p className="mt-1 text-sm text-gray-600">Tap Mark trained after you train. Or make a plan for set logging.</p>
        <button type="button" onClick={onComplete} disabled={busy === "workout"} className={`${PRIMARY_BTN} mt-4 w-full`}>
          {daily?.actuals.workout_completed ? "Trained · tap to undo" : "Mark trained"}
        </button>
        <button type="button" onClick={onAi} className={`${SECONDARY_BTN} mt-2 w-full`}>
          Log with text
        </button>
        <Link href="/workout" className={`${SECONDARY_BTN} mt-2 inline-flex w-full items-center justify-center`}>
          Make a workout plan
        </Link>
      </section>
    );
  }

  const today = plan.today_workout;
  if (today.is_rest_day) {
    return (
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-[#282828]">Rest day</h2>
        <p className="mt-1 text-sm text-gray-600">No session planned. Tap Mark trained if you still trained.</p>
        <button type="button" onClick={onComplete} disabled={busy === "workout"} className={`${PRIMARY_BTN} mt-4 w-full`}>
          {daily?.actuals.workout_completed ? "Trained · tap to undo" : "Mark trained"}
        </button>
        <button type="button" onClick={onAi} className={`${SECONDARY_BTN} mt-2 w-full`}>
          Log with text
        </button>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <section className={CARD}>
        <h2 className="text-lg font-semibold text-[#282828]">{today.focus_area}</h2>
        <p className="mt-1 text-sm text-gray-600">
          {today.estimated_duration_min} min · {today.estimated_calories} kcal · {today.exercises.length} exercises
        </p>
        <p className="mt-2 text-xs text-gray-500">
          Logging a set counts as trained. Tap Mark trained if you skipped set logging. Tap again to undo.
        </p>
        <button type="button" onClick={onComplete} disabled={busy === "workout"} className={`${PRIMARY_BTN} mt-4 w-full`}>
          {daily?.actuals.workout_completed ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Check size={16} /> Trained · tap to undo
            </span>
          ) : busy === "workout" ? (
            "Saving..."
          ) : (
            "Mark trained"
          )}
        </button>
      </section>

      <section className={CARD}>
        <h2 className="text-lg font-semibold text-[#282828]">Exercises</h2>
        <p className="mt-1 text-sm text-gray-600">Tap a row to log weight and reps for each set.</p>
        <div className="mt-4 space-y-2">
          {exercises.map((exercise) => {
            const done = exercise.sets.filter((set) => set.kind !== "warmup" && set.reps > 0).length;
            const pct = exercise.target_sets > 0 ? Math.min(100, Math.round((done / exercise.target_sets) * 100)) : 0;
            return (
              <button
                key={exercise.exercise_id}
                type="button"
                onClick={() => onOpenExercise(exercise)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-[#282828]">{exercise.exercise_name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {done}/{exercise.target_sets} sets · {exercise.target_reps} reps
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-gray-400" />
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <motion.div
                    className="h-full rounded-full bg-[#282828]"
                    initial={false}
                    animate={{ width: `${pct}%` }}
                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onAi} className={`${SECONDARY_BTN} mt-4 w-full`}>
          Log another workout
        </button>
      </section>
    </div>
  );
}
