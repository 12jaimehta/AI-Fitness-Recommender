"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { getDailyProgress, getUserProfile, getCoachingAdvice, seedDailyProgress, seedUserProfile } from "@/lib/service/progress-database";
import { localIsoDate } from "@/shared/lib/plan-tracking";
import type { DailyProgress, UserProfile, CoachingAdvice } from "@/shared/types";
import { CoachSkeleton, DashboardSkeleton, FillBarsSkeleton } from "@/components/ui/Skeleton";

function greetingName(userEmail?: string | null, profile?: UserProfile | null) {
  const fromProfile = profile?.full_name?.trim().split(" ")[0];
  if (fromProfile) return fromProfile;
  return userEmail?.split("@")[0] || "there";
}

function coachStatus(advice: CoachingAdvice) {
  if (advice.plateau || advice.status === "needs_new_plan") return "Change the plan";
  if (advice.status === "watch") return "Watch";
  if (advice.status === "learning") return "Learning you";
  return "On track";
}

function FillBar({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="flex justify-between gap-3 text-sm">
        <span className="font-semibold text-[#282828]">{label}</span>
        <span className="text-[#282828]">
          {Math.round(value)} / {target || 0} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
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

function Row({
  href,
  label,
  value,
}: {
  href: string;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-[#282828]"
    >
      <span>
        <span className="block text-xs text-gray-500">{label}</span>
        <span className="mt-0.5 block font-semibold text-[#282828]">{value}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-gray-400" />
    </Link>
  );
}

export default function DashboardClientPage({
  initialDaily = null,
  initialProfile = null,
}: {
  initialDaily?: DailyProgress | null;
  initialProfile?: UserProfile | null;
}) {
  const { user, isSignedIn, isLoading } = useUser();
  const [daily, setDaily] = useState<DailyProgress | null>(initialDaily);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [coaching, setCoaching] = useState<CoachingAdvice | null>(null);
  const [pageReady, setPageReady] = useState(Boolean(initialDaily || initialProfile));
  const [coachingReady, setCoachingReady] = useState(false);

  useEffect(() => {
    if (initialDaily) seedDailyProgress(initialDaily.date, initialDaily);
    if (initialProfile !== undefined) seedUserProfile(initialProfile);
  }, [initialDaily, initialProfile]);

  useEffect(() => {
    if (isLoading) return;
    if (!isSignedIn) {
      setPageReady(true);
      setCoachingReady(true);
      return;
    }
    let cancelled = false;
    if (!initialDaily && !initialProfile) setPageReady(false);
    setCoachingReady(false);
    Promise.allSettled([getDailyProgress(), getUserProfile()]).then(([dailyResult, profileResult]) => {
      if (cancelled) return;
      if (dailyResult.status === "fulfilled") setDaily(dailyResult.value);
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      setPageReady(true);
    });
    getCoachingAdvice()
      .then((advice) => {
        if (!cancelled) setCoaching(advice);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCoachingReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, isLoading, initialDaily, initialProfile]);

  if (isLoading || !pageReady) {
    return <DashboardSkeleton />;
  }

  const workout = daily?.workout_plan?.today_workout;
  const mealsLogged =
    daily?.actuals.meals_logged.filter((meal) => meal.source_type === "plan_checkoff").length || 0;
  const mealsTotal = daily?.diet_plan?.meals.length || 0;
  const dateIso = daily?.date || localIsoDate();
  const dateLabel = new Date(`${dateIso}T12:00:00`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const workoutValue = daily?.actuals.workout_completed
    ? "Done"
    : !daily?.workout_plan
      ? "Make a plan"
      : workout?.is_rest_day
        ? "Rest day"
        : workout?.focus_area || "Not logged";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="my-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hello, {greetingName(user?.email, profile)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{dateLabel}</p>
        </header>

        {!coachingReady ? (
          <CoachSkeleton />
        ) : coaching ? (
          <section className="mb-5 rounded-2xl border border-gray-200 bg-white px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-[#282828]">{coaching.headline}</p>
            </div>
          </section>
        ) : null}

        <section className="mb-5 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-[#282828]">Today</h2>
          {daily ? (
            <div className="mt-4 space-y-3">
              <FillBar
                label="Calories"
                value={daily.actuals.total_calories}
                target={daily.targets.calories}
                unit="kcal"
              />
              <FillBar
                label="Protein"
                value={daily.actuals.total_protein_g}
                target={daily.targets.protein_g}
                unit="g"
              />
              <FillBar
                label="Water"
                value={daily.actuals.water_intake_ml}
                target={daily.targets.water_ml || 3000}
                unit="ml"
              />
            </div>
          ) : (
            <div className="mt-4">
              <FillBarsSkeleton />
            </div>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Row
              href="/progress"
              label="Meals"
              value={
                daily?.diet_plan
                  ? `${mealsLogged}/${mealsTotal}`
                  : daily?.actuals.meals_logged.length
                    ? `${daily.actuals.meals_logged.length} logged`
                    : "Make a plan"
              }
            />
            <Row href="/progress" label="Workout" value={workoutValue} />
          </div>
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <Row
            href={daily?.workout_plan ? "/workout/plan" : "/workout"}
            label="Workout plan"
            value={daily?.workout_plan?.split_name || "Make a plan"}
          />
          <Row
            href={daily?.diet_plan ? "/diet/plan" : "/diet"}
            label="Diet plan"
            value={daily?.diet_plan?.plan_name || "Make a plan"}
          />
        </div>
      </div>
    </div>
  );
}
