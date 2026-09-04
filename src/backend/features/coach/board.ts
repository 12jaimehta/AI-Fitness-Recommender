import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { cacheDel, cacheGet, cacheSet, coachTodayKey } from "@backend/shared/lib/redis";
import { getCurrentDiet, getCurrentWorkout } from "@backend/features/plan-cache";
import { getCurrentPlans } from "@backend/features/progress/current-plans";
import { parseLogDate } from "@backend/features/progress/db";
import { addDaysIso, mealSlotLabel } from "@/shared/lib/plan-tracking";
import { coerceProgramGoal } from "@/shared/lib/program-goals";
import {
  clampMealBudget,
  extraStepsForSurplus,
  goalDelayDays,
  unpaidSurplus,
} from "@/shared/lib/coach/ledger";
import type {
  CoachDailyView,
  CoachInterviewView,
  CoachSlotView,
  CoachToday,
  CoachWeekReviewView,
} from "@/shared/types/coach";
import { asSlot, isCoachSchemaMissing, throwIfCoachSchemaMissing, type CoachDailyRow, type CoachSlotRow } from "./db";
import { insertEvent } from "./events";
import { computeWeekReview } from "./review";

export async function bumpCoachCache(userId: string, date: string) {
  await cacheDel(coachTodayKey(userId, date));
}

async function ensureProfile(auth: AuthCtx) {
  const diet = await getCurrentDiet(auth.user.id, auth);
  const workout = await getCurrentWorkout(auth.user.id, auth);
  const goal = coerceProgramGoal(diet?.formData?.goal || workout?.formData?.goal) || null;
  const targetKcal = diet?.plan ? Number(String(diet.plan.calorieTarget).replace(/[^\d]/g, "")) || null : null;
  const targetProtein = diet?.plan ? Number(String(diet.plan.proteinTarget).replace(/[^\d]/g, "")) || null : null;
  const row = {
    user_id: auth.user.id,
    goal,
    phase: diet || workout ? "block" : "onboarding",
    target_kcal: targetKcal,
    target_protein_g: targetProtein,
    diet_plan_id: diet?.id || null,
    workout_plan_id: workout?.id || null,
  };
  const { error } = await auth.supabase.from("coach_profiles").upsert(row, { onConflict: "user_id" });
  throwIfCoachSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return row;
}

export async function listSlots(auth: AuthCtx, date: string) {
  const { data, error } = await auth.supabase
    .from("coach_slots")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("date", date)
    .order("kind", { ascending: true });
  throwIfCoachSchemaMissing(error);
  return (data || []).map((row) => asSlot(row as Record<string, unknown>));
}

export async function getDaily(auth: AuthCtx, date: string): Promise<CoachDailyRow | null> {
  const { data, error } = await auth.supabase
    .from("coach_daily")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("date", date)
    .maybeSingle();
  throwIfCoachSchemaMissing(error);
  return (data as CoachDailyRow | null) || null;
}

export async function projectDaily(auth: AuthCtx, date: string) {
  const slots = await listSlots(auth, date);
  const meals = slots.filter((slot) => slot.kind === "meal");
  const session = slots.find((slot) => slot.kind === "session") || null;
  const existing = await getDaily(auth, date);
  let surplus = 0;
  let actual = 0;
  for (const meal of meals) {
    if (meal.actual_kcal == null) continue;
    actual += meal.actual_kcal;
    surplus += meal.actual_kcal - meal.budget_kcal;
  }
  const planned = meals.reduce((sum, meal) => sum + meal.budget_kcal, 0);
  const surplusKcal = Math.max(0, Math.round(surplus));
  const rest = Boolean(session?.plan_ref?.isRest);
  const row = {
    user_id: auth.user.id,
    date,
    planned_kcal: planned,
    actual_kcal: Math.round(actual),
    surplus_kcal: surplusKcal,
    extra_steps_target: extraStepsForSurplus(surplusKcal),
    extra_steps_done: existing?.extra_steps_done || 0,
    carryover_kcal: existing?.carryover_kcal || 0,
    carryover_applied: existing?.carryover_applied || false,
    meals_planned: meals.length,
    meals_logged: meals.filter((meal) => meal.status !== "planned").length,
    session_planned: Boolean(session && !rest),
    session_done: Boolean(session && (session.status === "done" || rest)),
    weight_kg: existing?.weight_kg ?? null,
    sleep_hours: existing?.sleep_hours ?? null,
    energy: existing?.energy ?? null,
  };
  const { error } = await auth.supabase.from("coach_daily").upsert(row, { onConflict: "user_id,date" });
  throwIfCoachSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  await bumpCoachCache(auth.user.id, date);
  return row;
}

async function applyCarryover(auth: AuthCtx, date: string) {
  const yesterday = addDaysIso(date, -1);
  const prior = await getDaily(auth, yesterday);
  if (!prior || prior.carryover_applied) return;
  const unpaid = unpaidSurplus(prior.surplus_kcal, prior.extra_steps_target, prior.extra_steps_done);
  const { error: markError } = await auth.supabase
    .from("coach_daily")
    .update({ carryover_applied: true, carryover_kcal: unpaid })
    .eq("user_id", auth.user.id)
    .eq("date", yesterday);
  throwIfCoachSchemaMissing(markError);
  if (unpaid <= 50) return;

  const slots = await listSlots(auth, date);
  const candidate = slots
    .filter((slot) => slot.kind === "meal" && slot.status === "planned")
    .sort((a, b) => b.budget_kcal - a.budget_kcal)[0];
  if (!candidate) return;

  const nextBudget = clampMealBudget(candidate.budget_kcal - unpaid);
  const { error } = await auth.supabase
    .from("coach_slots")
    .update({ budget_kcal: nextBudget })
    .eq("id", candidate.id)
    .eq("user_id", auth.user.id);
  throwIfCoachSchemaMissing(error);
  await insertEvent(auth, {
    date,
    slotId: candidate.id,
    kind: "carryover",
    payload: { from: yesterday, unpaid, slot_key: candidate.slot_key, nextBudget },
  });
}

async function upsertSlot(
  auth: AuthCtx,
  existing: CoachSlotRow | undefined,
  next: {
    date: string;
    kind: "meal" | "session";
    slot_key: string;
    title: string;
    budget_kcal: number;
    budget_protein_g: number;
    plan_ref: Record<string, unknown>;
  }
) {
  if (existing && existing.status !== "planned") return;
  const row = {
    user_id: auth.user.id,
    ...next,
    status: existing?.status || "planned",
  };
  const { error } = await auth.supabase.from("coach_slots").upsert(row, {
    onConflict: "user_id,date,kind,slot_key",
  });
  throwIfCoachSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
}

export async function ensureDay(dateInput?: string | null, auth?: AuthCtx) {
  const resolved = await resolveAuth(auth);
  const date = parseLogDate(dateInput);
  await ensureProfile(resolved);
  const [plans, existing] = await Promise.all([
    getCurrentPlans(date, resolved),
    listSlots(resolved, date),
  ]);
  const byKey = new Map(existing.map((slot) => [`${slot.kind}:${slot.slot_key}`, slot]));

  for (const meal of plans.diet_plan?.meals || []) {
    await upsertSlot(resolved, byKey.get(`meal:${meal.slot}`), {
      date,
      kind: "meal",
      slot_key: meal.slot,
      title: meal.meal_name || mealSlotLabel(meal.slot),
      budget_kcal: meal.total_meal_calories,
      budget_protein_g: meal.total_meal_protein,
      plan_ref: { meal_id: meal.meal_id },
    });
  }

  const session = plans.workout_plan?.today_workout;
  if (session) {
    await upsertSlot(resolved, byKey.get("session:workout"), {
      date,
      kind: "session",
      slot_key: "workout",
      title: session.is_rest_day ? "Rest day" : session.focus_area || "Workout",
      budget_kcal: session.estimated_calories,
      budget_protein_g: 0,
      plan_ref: {
        isRest: session.is_rest_day,
        duration: session.estimated_duration_min,
        workout_id: session.workout_id,
      },
    });
  }

  await applyCarryover(resolved, date);
  await projectDaily(resolved, date);
  return date;
}

function toView(slot: CoachSlotRow): CoachSlotView {
  return {
    id: slot.id,
    kind: slot.kind,
    slotKey: slot.slot_key,
    title: slot.title,
    budgetKcal: slot.budget_kcal,
    budgetProteinG: slot.budget_protein_g,
    status: slot.status,
    actualKcal: slot.actual_kcal,
    actualProteinG: slot.actual_protein_g,
    actualLabel: slot.actual_label,
    feel: slot.feel,
    isRest: Boolean(slot.plan_ref?.isRest),
  };
}

function dailyView(row: CoachDailyRow | null): CoachDailyView {
  const surplus = row?.surplus_kcal || 0;
  return {
    plannedKcal: row?.planned_kcal || 0,
    actualKcal: row?.actual_kcal || 0,
    surplusKcal: surplus,
    extraStepsTarget: row?.extra_steps_target || 0,
    extraStepsDone: row?.extra_steps_done || 0,
    carryoverKcal: row?.carryover_kcal || 0,
    delayDays: goalDelayDays(unpaidSurplus(surplus, row?.extra_steps_target || 0, row?.extra_steps_done || 0)),
    weightKg: row?.weight_kg ?? null,
    sleepHours: row?.sleep_hours ?? null,
    energy: (row?.energy as CoachDailyView["energy"]) || null,
    mealsPlanned: row?.meals_planned || 0,
    mealsLogged: row?.meals_logged || 0,
    sessionPlanned: Boolean(row?.session_planned),
    sessionDone: Boolean(row?.session_done),
  };
}

async function openInterview(auth: AuthCtx, date: string): Promise<CoachInterviewView | null> {
  const { data, error } = await auth.supabase
    .from("coach_interviews")
    .select("*")
    .eq("user_id", auth.user.id)
    .eq("date", date)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfCoachSchemaMissing(error);
  if (!data) return null;
  const slot = (data as { slot_id?: string }).slot_id
    ? (await listSlots(auth, date)).find((item) => item.id === (data as { slot_id: string }).slot_id)
    : null;
  const draft = (data as { draft?: CoachInterviewView["draft"] }).draft;
  return {
    id: String((data as { id: string }).id),
    kind: (data as { kind: CoachInterviewView["kind"] }).kind,
    slotId: String((data as { slot_id: string }).slot_id || ""),
    slotKey: slot?.slot_key || "",
    slotTitle: slot?.title || "",
    status: "open",
    questions: Array.isArray((data as { questions: unknown }).questions)
      ? ((data as { questions: CoachInterviewView["questions"] }).questions)
      : [],
    answers: ((data as { answers?: Record<string, string> }).answers || {}) as Record<string, string>,
    draft: draft && typeof draft === "object" && "meal_name" in (draft as object) ? (draft as CoachInterviewView["draft"]) : null,
    options: Array.isArray((data as { options: unknown }).options)
      ? ((data as { options: CoachInterviewView["options"] }).options)
      : [],
    headline: String((data as { draft?: { explanation?: string } }).draft?.explanation || "A couple of details."),
  };
}

function headlineFor(board: { hasDiet: boolean; hasWorkout: boolean; daily: CoachDailyView; review: CoachWeekReviewView | null }) {
  if (!board.hasDiet && !board.hasWorkout) return "First we need a plan. Then we coach the week.";
  if (board.daily.extraStepsTarget > 0 && board.daily.extraStepsDone < board.daily.extraStepsTarget) {
    return "Different from the plan. Extra walk today holds it.";
  }
  if (board.review?.headline) return board.review.headline;
  return "Today. Change the slot that slips — not the whole plan.";
}

const SETUP: CoachToday = {
  date: "",
  setupRequired: true,
  setupMessage: "Paste supabase/schema/11_coach.sql in the Supabase SQL editor, then refresh.",
  hasDiet: false,
  hasWorkout: false,
  goal: null,
  targetKcal: null,
  headline: "Coach needs a database table.",
  meals: [],
  session: null,
  daily: dailyView(null),
  openInterview: null,
  review: null,
};

export async function getTodayBoard(dateInput?: string | null, auth?: AuthCtx): Promise<CoachToday> {
  const resolved = await resolveAuth(auth);
  let date: string;
  try {
    date = parseLogDate(dateInput);
  } catch (error) {
    throw error;
  }

  const cached = await cacheGet<CoachToday>(coachTodayKey(resolved.user.id, date));
  if (cached && !cached.setupRequired) return cached;

  try {
    await ensureDay(date, resolved);
    const [slots, daily, interview, profile, review] = await Promise.all([
      listSlots(resolved, date),
      getDaily(resolved, date),
      openInterview(resolved, date),
      resolved.supabase.from("coach_profiles").select("goal, target_kcal").eq("user_id", resolved.user.id).maybeSingle(),
      computeWeekReview(date, resolved),
    ]);
    const meals = slots.filter((slot) => slot.kind === "meal").map(toView);
    const session = slots.find((slot) => slot.kind === "session") || null;
    const board: CoachToday = {
      date,
      setupRequired: false,
      setupMessage: null,
      hasDiet: meals.length > 0,
      hasWorkout: Boolean(session),
      goal: profile.data?.goal ? String(profile.data.goal) : null,
      targetKcal: profile.data?.target_kcal == null ? null : Number(profile.data.target_kcal),
      headline: "",
      meals,
      session: session ? toView(session) : null,
      daily: dailyView(daily),
      openInterview: interview,
      review,
    };
    board.headline = headlineFor(board);
    await cacheSet(coachTodayKey(resolved.user.id, date), board, 60);
    return board;
  } catch (error) {
    if (isCoachSchemaMissing(error)) return { ...SETUP, date };
    throw error;
  }
}

export async function seedCoachFromPlans(userId?: string, auth?: AuthCtx) {
  try {
    const resolved = await resolveAuth(auth);
    if (userId && resolved.user.id !== userId) return;
    await ensureDay(undefined, resolved);
  } catch {
    /* schema not pasted yet — plan save still succeeds */
  }
}
