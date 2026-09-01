"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DailyMeals, DietPlanData, MealData } from "@/shared/types";
import type { DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import { resolveDietPlan, saveDietPlan, beginDietPlanGeneration } from "@/lib/service/dietWorkoutplan";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import { PlanResultSkeleton } from "@/components/ui/Skeleton";
import PlanPairingCard from "@/components/shared/PlanPairingCard";
import { readGeneratedWorkoutPlan } from "@frontend/features/workout-plan";
import { readPendingDietGeneration } from "@frontend/features/diet-plan";

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

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

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
  return new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as (typeof WEEKDAYS)[number];
}

function MacroRow({ meal }: { meal: MealData }) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <dt className="text-xs text-gray-500">Calories</dt>
        <dd className="mt-1 text-sm font-semibold text-[#282828]">{meal.calories}</dd>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <dt className="text-xs text-gray-500">Protein</dt>
        <dd className="mt-1 text-sm font-semibold text-[#282828]">{meal.protein} g</dd>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <dt className="text-xs text-gray-500">Carbs</dt>
        <dd className="mt-1 text-sm font-semibold text-[#282828]">{meal.carbs} g</dd>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
        <dt className="text-xs text-gray-500">Fat</dt>
        <dd className="mt-1 text-sm font-semibold text-[#282828]">{meal.fat} g</dd>
      </div>
    </dl>
  );
}

function MealCard({ mealType, meal }: { mealType: string; meal: MealData }) {
  const ingredients = ingredientText(meal.ingredientBreakdown);
  const alternatives = meal.alternatives?.filter((item) => item.name) ?? [];

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-[#282828]">{MEAL_LABELS[mealType] || mealType}</h3>
      <p className="mt-2 text-base text-gray-800">{meal.name}</p>
      <MacroRow meal={meal} />
      {ingredients ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#282828]">Ingredients</h4>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{ingredients}</p>
        </div>
      ) : null}
      {alternatives.length > 0 ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-[#282828]">You can also eat</h4>
          <ul className="mt-2 space-y-2">
            {alternatives.map((item) => (
              <li key={item.name} className="text-sm text-gray-600">
                {item.name}
                {item.calories ? ` (${item.calories} calories)` : ""}
                {item.description ? `. ${item.description}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export default function DietPlanResultPage() {
  const { user, loading } = useCurrentUser();
  const [formData, setFormData] = useState<DietPlanFormData | null>(null);
  const [plan, setPlan] = useState<DietPlanData | null>(null);
  const [selectedDay, setSelectedDay] = useState<(typeof WEEKDAYS)[number]>(todayWeekday());
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [missing, setMissing] = useState(false);
  const [otherExists, setOtherExists] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (loading) return;
    setError("");
    setMissing(false);
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
      setMissing(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loading, user?.id, retryKey]);

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
              { label: "Diet Plan", href: "/diet" },
              { label: "Your meals" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900">Could not make your meal plan</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const pending = readPendingDietGeneration();
                if (pending?.formData) beginDietPlanGeneration(pending.formData);
                setError("");
                setRetryKey((value) => value + 1);
              }}
              className="inline-flex rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              href="/diet"
              className="inline-flex rounded-xl border border-[#282828] px-5 py-3 text-sm font-semibold text-[#282828]"
            >
              Edit details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (missing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <PageBreadcrumb
            items={[
              { label: "Home" },
              { label: "Diet Plan", href: "/diet" },
              { label: "Your meals" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900">No diet plan yet</h1>
          <p className="mt-2 text-gray-600">Make a plan first. Then you can view it here.</p>
          <Link
            href="/diet"
            className="mt-6 inline-flex rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white"
          >
            Make a diet plan
          </Link>
        </div>
      </div>
    );
  }

  if (!plan) {
    return <PlanResultSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          items={[
            { label: "Home" },
            { label: "Diet Plan", href: "/diet" },
            { label: "Your meals" },
          ]}
        />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your meal plan</h1>
          <p className="mt-2 text-gray-600">Eat these meals. The numbers are how much energy each meal has.</p>
        </header>

        <PlanPairingCard
          context="diet-result"
          otherExists={otherExists}
          goal={formData?.goal}
        />

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-[#282828]">Eat this much today</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Calories</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">{calories(plan.calorieTarget)}</dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Protein</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">{grams(plan.proteinTarget)}</dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Carbs</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">{grams(plan.carbTarget)}</dd>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <dt className="text-sm text-gray-500">Fat</dt>
              <dd className="mt-1 text-xl font-semibold text-[#282828]">{grams(plan.fatTarget)}</dd>
            </div>
          </dl>
        </section>

        <section className="mb-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#282828]">What to eat</h2>
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

          <div className="space-y-4">
            {meals.map(([mealType, meal]) => (
              <MealCard key={mealType} mealType={mealType} meal={meal} />
            ))}
          </div>
        </section>

        {plan.nutritionTips?.length ? (
          <section className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-[#282828]">Tips</h2>
            <ol className="list-decimal space-y-3 rounded-2xl border border-gray-200 bg-white p-5 pl-8 sm:p-6 sm:pl-9">
              {plan.nutritionTips.map((tip, index) => (
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
            href="/diet"
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
