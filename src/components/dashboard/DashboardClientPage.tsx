"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Apple, Dumbbell, Activity, Users } from "lucide-react";
import { useUser } from "@/lib/hooks/use-user";
import { getDailyProgress, getUserProfile } from "@/lib/service/progress-database";
import type { DailyProgress, UserProfile } from "@/shared/types";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";

const PRIMARY = [
  {
    href: "/workout",
    title: "Workout plan",
    text: "Set training first (Hyrox, Ironman, bodybuilding). Then match food to it.",
    action: "Make a workout plan",
    icon: Dumbbell,
  },
  {
    href: "/diet",
    title: "Diet plan",
    text: "Fuel the workout. Calories follow how you train.",
    action: "Make a diet plan",
    icon: Apple,
  },
  {
    href: "/progress",
    title: "Progress",
    text: "Log meals, workouts, weight, water, and sleep.",
    action: "Open progress",
    icon: Activity,
  },
  {
    href: "/fyte-connect",
    title: "Trainers",
    text: "Hire a trainer or become one.",
    action: "Open trainers",
    icon: Users,
  },
] as const;

const ACCOUNT_LINKS = [
  { href: "/workout/plan", title: "Current workout plan", detail: "See the sessions you just generated." },
  { href: "/diet/plan", title: "Current diet plan", detail: "See the meal plan you just generated." },
  { href: "/my-profile", title: "My profile", detail: "Your name, age, and fitness details." },
  { href: "/fyte-connect/become-trainer", title: "Become a trainer", detail: "List yourself so people can hire you." },
];

const HELP_LINKS = [
  { href: "/help", title: "Help center" },
  { href: "/help/getting-started", title: "Getting started" },
  { href: "/help/faqs", title: "FAQs" },
  { href: "/help/contact", title: "Contact" },
  { href: "/about", title: "About" },
  { href: "/privacy", title: "Privacy" },
  { href: "/terms", title: "Terms" },
];

function greetingName(userEmail?: string | null, profile?: UserProfile | null) {
  const fromProfile = profile?.full_name?.trim().split(" ")[0];
  if (fromProfile) return fromProfile;
  return userEmail?.split("@")[0] || "there";
}

export default function DashboardClientPage() {
  const { user, isSignedIn, isLoading } = useUser();
  const [daily, setDaily] = useState<DailyProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    Promise.allSettled([getDailyProgress(), getUserProfile()]).then(([dailyResult, profileResult]) => {
      if (cancelled) return;
      if (dailyResult.status === "fulfilled") setDaily(dailyResult.value);
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
    });
    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto flex min-h-[50vh] max-w-7xl items-center justify-center px-4">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const workout = daily?.workout_plan?.today_workout;
  const workoutLabel = !daily?.workout_plan
    ? "No plan yet"
    : workout?.is_rest_day
      ? "Rest day"
      : daily.actuals.workout_completed
        ? "Done"
        : "Not logged";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb items={[{ label: "Home" }]} />

        <header className="mb-10 border-b border-gray-200 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Hello, {greetingName(user?.email, profile)}
          </h1>
          <p className="mt-2 text-gray-600">Your plans, progress, and pages in one place.</p>
        </header>

        {daily ? (
          <section className="mb-10">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-lg font-semibold text-[#282828]">Today</h2>
              <Link
                href="/progress"
                className="inline-flex items-center rounded-xl border-2 border-[#282828] bg-white px-5 py-2.5 text-sm font-semibold text-[#282828] transition hover:bg-[#282828] hover:text-white"
              >
                Open progress
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-500">Calories</dt>
                <dd className="mt-1 text-xl font-semibold text-[#282828]">
                  {daily.actuals.total_calories} / {daily.targets.calories || "-"}
                </dd>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-500">Protein</dt>
                <dd className="mt-1 text-xl font-semibold text-[#282828]">
                  {daily.actuals.total_protein_g} / {daily.targets.protein_g || "-"} g
                </dd>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-500">Water</dt>
                <dd className="mt-1 text-xl font-semibold text-[#282828]">
                  {daily.actuals.water_intake_ml} ml
                </dd>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <dt className="text-sm text-gray-500">Workout</dt>
                <dd className="mt-1 text-xl font-semibold text-[#282828]">{workoutLabel}</dd>
              </div>
            </dl>
            {!daily.diet_plan ? (
              <p className="mt-3 text-sm text-gray-500">
                No saved diet plan yet. Make one, then save it to track meals here.
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#282828]">Plans</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PRIMARY.map((item) => (
              <article
                key={item.href}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#282828] text-white">
                  <item.icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-[#282828]">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">{item.text}</p>
                {/* <p className="mt-3 text-xs text-gray-400">{item.href}</p> */}
                <Link
                  href={item.href}
                  className="mt-5 inline-flex w-fit items-center justify-center rounded-xl bg-[#282828] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#454545]"
                >
                  {item.action}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#282828]">Account</h2>
          <div className="space-y-3">
            {ACCOUNT_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-[#282828] sm:flex-row sm:items-center sm:justify-between"
              >
                <span>
                  <span className="block font-semibold text-[#282828]">{item.title}</span>
                  <span className="mt-1 block text-sm text-gray-600">{item.detail}</span>
                </span>
                {/* <span className="mt-2 text-sm text-gray-400 sm:mt-0">{item.href}</span> */}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-[#282828]">Help</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {HELP_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-[#282828]"
              >
                <span className="block font-semibold text-[#282828]">{item.title}</span>
                {/* <span className="mt-1 block text-sm text-gray-400">{item.href}</span> */}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
