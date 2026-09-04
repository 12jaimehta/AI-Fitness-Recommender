"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DailyMeals, DietPlanData, MealData } from "@/shared/types";
import type { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import { resolveDietPlan, saveDietPlan, beginDietPlanGeneration, beginDietFromLogs } from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { PlanResultSkeleton } from "@/components/ui/Skeleton";
import PageHero from "@/components/shared/PageHero";
import { delay, FadeIn } from "@/components/shared/Motion";
import { readGeneratedWorkoutPlan } from "@frontend/features/workout-plan";
import { readPendingDietGeneration } from "@frontend/features/diet-plan";
import { coerceProgramGoal, programGoalLabel } from "@/shared/lib/program-goals";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

const MEAL_ORDER = [
  "breakfast",
  "morningSnack",
  "lunch",
  "afternoonSnack",
  "snacks",
  "eveningSnack",
  "dinner",
  "beforeBed",
] as const;

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  morningSnack: "Morning snack",
  lunch: "Lunch",
  afternoonSnack: "Afternoon snack",
  snacks: "Snack",
  eveningSnack: "Evening snack",
  dinner: "Dinner",
  beforeBed: "Before bed",
};

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function mealList(meals?: DailyMeals | null) {
  if (!meals) return [];
  const entries = Object.entries(meals).filter(([, meal]) => meal && meal.name);
  return entries.sort(([a], [b]) => {
    const aIndex = MEAL_ORDER.indexOf(a as (typeof MEAL_ORDER)[number]);
    const bIndex = MEAL_ORDER.indexOf(b as (typeof MEAL_ORDER)[number]);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  }) as [string, MealData][];
}

function ingredientText(value: MealData["ingredientBreakdown"]) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return Object.entries(value)
    .map(([key, amount]) => `${key}: ${amount}`)
    .join("\n");
}

function hasDifferentWeekDays(plan: DietPlanData) {
  if (!plan.weeklyPlan) return false;
  const dayNames = WEEKDAYS.map((day) => plan.weeklyPlan?.[day]?.breakfast?.name || "");
  const unique = new Set(dayNames.filter(Boolean));
  if (unique.size > 1) return true;
  const todayName = plan.meals?.breakfast?.name || "";
  return Boolean(todayName && dayNames[0] && dayNames[0] !== todayName);
}

function grams(value: string | number | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return "-";
  return /g$/i.test(text) ? text : `${text} g`;
}

function calories(value: string | number | undefined) {
  const text = String(value ?? "").trim();
  if (!text) return "-";
  return text.replace(/\s*calories?$/i, "");
}

function todayWeekday() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as (typeof WEEKDAYS)[number];
}

function MealCard({ mealType, meal, index }: { mealType: string; meal: MealData; index: number }) {
  const ingredients = ingredientText(meal.ingredientBreakdown);
  const alternatives = meal.alternatives?.filter((item) => item.name) ?? [];
  const [open, setOpen] = useState(false);

  return (
    <FadeIn delay={delay(index)}>
      <article className={cn(fyte.card, fyte.cardHover)}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={fyte.kicker}>{MEAL_LABELS[mealType] || mealType}</p>
            <h3 className="mt-1 text-lg font-bold leading-snug text-fyte-ink sm:text-xl">{meal.name}</h3>
          </div>
          <p className="shrink-0 rounded-full bg-fyte-ink px-3 py-1 text-sm font-bold text-white">
            {calories(meal.calories)} kcal
          </p>
        </div>
        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {[
            ["Protein", grams(meal.protein)],
            ["Carbs", grams(meal.carbs)],
            ["Fat", grams(meal.fat)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="text-fyte-muted">{label}</dt>
              <dd className="font-semibold text-fyte-ink">{value}</dd>
            </div>
          ))}
        </dl>
        {ingredients || alternatives.length ? (
          <>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-4 text-sm font-semibold text-fyte-ink underline-offset-4 hover:underline"
            >
              {open ? "Hide details" : "Ingredients and swaps"}
            </button>
            {open ? (
              <div className="mt-4 grid gap-5 border-t border-fyte-line pt-4 sm:grid-cols-2">
                {ingredients ? (
                  <div>
                    <h4 className="text-sm font-semibold text-fyte-ink">Ingredients</h4>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-fyte-muted">{ingredients}</p>
                  </div>
                ) : null}
                {alternatives.length ? (
                  <div>
                    <h4 className="text-sm font-semibold text-fyte-ink">You can also eat</h4>
                    <ul className="mt-2 space-y-2">
                      {alternatives.map((item) => (
                        <li key={item.name} className="text-sm leading-6 text-fyte-muted">
                          <span className="font-medium text-fyte-ink">{item.name}</span>
                          {item.calories ? ` · ${item.calories} kcal` : ""}
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
      </article>
    </FadeIn>
  );
}

export default function DietPlanResultPage() {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const [formData, setFormData] = useState<DietPlanFormData | null>(null);
  const [plan, setPlan] = useState<DietPlanData | null>(null);
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
    resolveDietPlan(user?.id).then((result) => {
      if (cancelled) return;
      if (result.status === "ready") {
        setFormData(result.session.formData);
        setPlan(result.session.plan);
        setOtherExists(Boolean(readGeneratedWorkoutPlan()));
        return;
      }
      if (result.status === "error") {
        setError(result.error);
        return;
      }
      router.replace("/diet");
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user?.id, retryKey, router]);

  const showWeek = Boolean(plan && hasDifferentWeekDays(plan));
  const meals = useMemo(() => {
    if (!plan) return [];
    if (showWeek) return mealList(plan.weeklyPlan?.[selectedDay] || plan.meals);
    const fromMeals = mealList(plan.meals);
    if (fromMeals.length) return fromMeals;
    return mealList(plan.weeklyPlan?.[selectedDay] || plan.weeklyPlan?.monday);
  }, [plan, selectedDay, showWeek]);

  const handleSave = async () => {
    if (!user || !formData || !plan) return;
    setSaving(true);
    setSaveMessage("");
    try {
      await saveDietPlan(user.id, formData, plan);
      setSaveMessage("Saved. The coach will use this plan.");
    } catch {
      setSaveMessage("Could not save the plan. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    const pending = readPendingDietGeneration();
    return (
      <div className={fyte.page}>
        <PageHero
          photo="diet"
          kicker="Diet plan"
          title="Could not make your meal plan"
          subtitle={error}
          actions={
            <>
              <button
                type="button"
                className={fyte.glassSolid}
                onClick={() => {
                  if (pending?.fromLogs) beginDietFromLogs();
                  else if (pending?.formData) beginDietPlanGeneration(pending.formData);
                  setError("");
                  setRetryKey((value) => value + 1);
                }}
              >
                Try again
              </button>
              <Link href={pending?.fromLogs ? "/progress" : "/diet"} className={fyte.glass}>
                {pending?.fromLogs ? "Back to coach" : "Edit details"}
              </Link>
            </>
          }
        />
      </div>
    );
  }

  if (!plan) return <PlanResultSkeleton />;

  const goal = coerceProgramGoal(formData?.goal) ? programGoalLabel(formData?.goal) : "";

  return (
    <div className={fyte.page}>
      <PageHero
        photo="diet"
        kicker={goal ? `Diet plan · ${goal}` : "Diet plan"}
        title="Your meal plan"
        subtitle="Eat these. Tell the coach what actually happened and it adjusts the rest."
        actions={
          <>
            <button type="button" onClick={handleSave} disabled={saving} className={fyte.glassSolid}>
              {saving ? "Saving…" : "Save this plan"}
            </button>
            <Link href={otherExists ? "/workout/plan" : "/workout"} className={fyte.glass}>
              {otherExists ? "See matching workout" : "Make a matching workout"}
            </Link>
            <Link href="/diet" className={fyte.glass}>
              New plan
            </Link>
          </>
        }
        aside={
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[26rem]">
            {[
              ["Calories", calories(plan.calorieTarget)],
              ["Protein", grams(plan.proteinTarget)],
              ["Carbs", grams(plan.carbTarget)],
              ["Fat", grams(plan.fatTarget)],
            ].map(([label, value]) => (
              <div key={label} className={fyte.stat}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</dt>
                <dd className="mt-1 text-xl font-extrabold">{value}</dd>
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
            <h2 className="text-xl font-bold text-fyte-ink">What to eat{showWeek ? "" : " every day"}</h2>
            {showWeek ? (
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition",
                      selectedDay === day
                        ? "bg-fyte-ink text-white"
                        : "border border-fyte-line bg-fyte-card text-fyte-ink hover:border-fyte-ink"
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="space-y-4">
            {meals.map(([mealType, meal], index) => (
              <MealCard key={`${selectedDay}-${mealType}`} mealType={mealType} meal={meal} index={index} />
            ))}
          </div>
        </section>

        {plan.nutritionTips?.length ? (
          <section className="mt-12 rounded-2xl bg-fyte-ink p-6 text-white shadow-card sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">How to make it stick</p>
            <ol className="mt-4 grid gap-4 sm:grid-cols-2">
              {plan.nutritionTips.map((tip, index) => (
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
