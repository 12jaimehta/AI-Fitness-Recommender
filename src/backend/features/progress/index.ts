import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { completeJson } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { buildProgressInsightsPrompt } from "@backend/ai/prompts/insights";
import { fallbackProgressInsights } from "@backend/ai/fallbacks/insights";
import { asLoggedMeals, mealsPerDayFromForm, parseLeadingNumber, weekStartMonday } from "@/shared/lib/plan-tracking";
import { hasRequiredProfileDetails } from "@/shared/lib/profile";
import { recacheUserPlans } from "@backend/features/plan-cache";
import { getLatestDietPlan, getLatestWorkoutPlan, getTrackingContext } from "./plans";
import type {
  ChartPoint,
  DailyNutrition,
  DietTrack,
  TrackInsight,
  TrackKind,
  TrackRange,
  UserProfile,
  WorkoutEntry,
  WorkoutTrack,
} from "@/shared/types";

export type { TrackRange, TrackKind, ChartPoint, DietTrack, WorkoutTrack, TrackInsight } from "@/shared/types";
export { getTrackingContext, logDietMeal, logPlanWorkout } from "./plans";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DEFAULT_CALORIE_TARGET = 2200;

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function todayIso() {
  return new Date().toISOString().split("T")[0];
}

function datePart(value: string) {
  return value.slice(0, 10);
}

export function parseTrackRange(value: string | null): TrackRange {
  if (value === "week" || value === "year" || value === "last_year" || value === "month") return value;
  return "month";
}

function rangeWindow(range: TrackRange) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const today = todayIso();

  if (range === "week") {
    return {
      from: weekStartMonday(today),
      to: today,
      bucket: "day" as const,
      year,
      month,
    };
  }
  if (range === "month") {
    return {
      from: `${year}-${pad(month + 1)}-01`,
      to: today,
      bucket: "day" as const,
      year,
      month,
    };
  }
  if (range === "year") {
    return { from: `${year}-01-01`, to: today, bucket: "month" as const, year, month: 0 };
  }
  return {
    from: `${year - 1}-01-01`,
    to: `${year - 1}-12-31`,
    bucket: "month" as const,
    year: year - 1,
    month: 0,
  };
}

function emptyMacros() {
  return { calories: 0, protein: 0, carbs: 0, fats: 0 };
}

export async function getProfile(auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
  return data as UserProfile | null;
}

export async function upsertProfile(profile: Omit<UserProfile, "created_at" | "updated_at">) {
  const resolved = await resolveAuth();
  const { supabase, user } = resolved;
  const payload = { ...profile, id: user.id, email: profile.email || user.email };
  const { data, error } = await supabase.from("user_profiles").upsert(payload).select().single();
  if (error) throw new ApiError(error.message, 400);
  await recacheUserPlans(user.id, resolved);
  return data as UserProfile;
}

export async function updateProfile(updates: Partial<UserProfile>) {
  const resolved = await resolveAuth();
  const { supabase, user } = resolved;
  const { data: existing } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle();
  const merged = {
    ...(existing || {}),
    ...updates,
    id: user.id,
    email: updates.email || existing?.email || user.email || "",
  };
  const payload = {
    id: user.id,
    email: merged.email,
    full_name: merged.full_name ?? null,
    age: merged.age ?? null,
    gender: merged.gender ?? null,
    height: merged.height ?? null,
    initial_weight: merged.initial_weight ?? null,
    fitness_level: merged.fitness_level ?? null,
    goals: Array.isArray(merged.goals) ? merged.goals : [],
    profile_completed: hasRequiredProfileDetails(merged),
  };

  const { data, error } = await supabase.from("user_profiles").upsert(payload).select().single();
  if (error) throw new ApiError(error.message, 400);
  await recacheUserPlans(user.id, resolved);
  return data as UserProfile;
}

export async function getNutrition(date: string, auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase
    .from("daily_nutrition")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();
  return data as DailyNutrition | null;
}

async function listNutritionRange(from: string, to: string, auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase
    .from("daily_nutrition")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  return (data || []) as DailyNutrition[];
}

async function listWorkoutRange(from: string, to: string, auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data } = await supabase
    .from("workout_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: false });
  return (data || []) as WorkoutEntry[];
}

function dietPoints(rows: DailyNutrition[], window: ReturnType<typeof rangeWindow>): ChartPoint[] {
  const byDate = new Map(rows.map((row) => [datePart(String(row.date)), row]));

  if (window.bucket === "day") {
    const days = new Date(Date.UTC(window.year, window.month + 1, 0)).getUTCDate();
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const key = `${window.year}-${pad(window.month + 1)}-${pad(day)}`;
      return { label: String(day), value: toNumber(byDate.get(key)?.calories) };
    });
  }

  const byMonth = new Array(12).fill(0);
  for (const row of rows) {
    const month = Number(datePart(String(row.date)).slice(5, 7)) - 1;
    if (month >= 0 && month < 12) byMonth[month] += toNumber(row.calories);
  }
  return MONTHS.map((label, i) => ({ label, value: byMonth[i] }));
}

function workoutPoints(rows: WorkoutEntry[], window: ReturnType<typeof rangeWindow>): ChartPoint[] {
  if (window.bucket === "day") {
    const days = new Date(Date.UTC(window.year, window.month + 1, 0)).getUTCDate();
    const byDate = new Map<string, number>();
    for (const row of rows) {
      const key = datePart(String(row.date));
      byDate.set(key, (byDate.get(key) || 0) + toNumber(row.calories_burned));
    }
    return Array.from({ length: days }, (_, i) => {
      const day = i + 1;
      const key = `${window.year}-${pad(window.month + 1)}-${pad(day)}`;
      return { label: String(day), value: byDate.get(key) || 0 };
    });
  }

  const byMonth = new Array(12).fill(0);
  for (const row of rows) {
    const month = Number(datePart(String(row.date)).slice(5, 7)) - 1;
    if (month >= 0 && month < 12) byMonth[month] += toNumber(row.calories_burned);
  }
  return MONTHS.map((label, i) => ({ label, value: byMonth[i] }));
}

export async function getDietTrack(range: TrackRange, auth?: AuthCtx): Promise<DietTrack> {
  const resolved = await resolveAuth(auth);
  const window = rangeWindow(range);
  const [rows, profile, dietPlan] = await Promise.all([
    listNutritionRange(window.from, window.to, resolved),
    getProfile(resolved),
    getLatestDietPlan(resolved),
  ]);
  const todayKey = todayIso();
  const todayRow = rows.find((row) => datePart(String(row.date)) === todayKey);
  const totals = rows.reduce((sum, row) => ({
    calories: sum.calories + toNumber(row.calories),
    protein: sum.protein + toNumber(row.protein),
    carbs: sum.carbs + toNumber(row.carbs),
    fats: sum.fats + toNumber(row.fats),
  }), emptyMacros());
  const planTarget = parseLeadingNumber(dietPlan?.diet_plan?.calorieTarget);
  const loggedMeals = asLoggedMeals(todayRow?.meals);

  return {
    range,
    from: window.from,
    to: window.to,
    unit: "kcal",
    target: planTarget || toNumber(profile?.calorie_target, DEFAULT_CALORIE_TARGET),
    points: dietPoints(rows, window),
    today: todayRow
      ? {
          calories: toNumber(todayRow.calories),
          protein: toNumber(todayRow.protein),
          carbs: toNumber(todayRow.carbs),
          fats: toNumber(todayRow.fats),
        }
      : emptyMacros(),
    totals,
    mealsPerDay: dietPlan ? mealsPerDayFromForm(dietPlan.form_data) : 0,
    mealsLogged: Object.keys(loggedMeals).length,
    planTitle: dietPlan?.title || null,
  };
}

export async function getWorkoutTrack(range: TrackRange, auth?: AuthCtx): Promise<WorkoutTrack> {
  const resolved = await resolveAuth(auth);
  const window = rangeWindow(range);
  const [rows, workoutPlan] = await Promise.all([
    listWorkoutRange(window.from, window.to, resolved),
    getLatestWorkoutPlan(resolved),
  ]);
  const todayKey = todayIso();
  const todayRows = rows.filter((row) => datePart(String(row.date)) === todayKey);
  const weekFrom = weekStartMonday(todayKey);
  const weekRows = rows.filter((row) => datePart(String(row.date)) >= weekFrom && datePart(String(row.date)) <= todayKey);

  const sumRows = (list: WorkoutEntry[]) => ({
    calories: list.reduce((s, row) => s + toNumber(row.calories_burned), 0),
    minutes: list.reduce((s, row) => s + toNumber(row.duration_minutes), 0),
    sessions: list.length,
  });

  return {
    range,
    from: window.from,
    to: window.to,
    unit: "kcal",
    points: workoutPoints(rows, window),
    today: sumRows(todayRows),
    totals: sumRows(rows),
    recent: rows.slice(0, 5).map((row) => ({
      id: row.id,
      workout_type: row.workout_type,
      duration_minutes: toNumber(row.duration_minutes),
      calories_burned: toNumber(row.calories_burned),
      date: datePart(String(row.date)),
    })),
    frequency: parseLeadingNumber(workoutPlan?.form_data?.workoutFrequency),
    sessionsThisWeek: weekRows.length,
    planTitle: workoutPlan?.title || null,
  };
}

export async function getTrackInsights(
  track: TrackKind,
  range: TrackRange,
  date?: string | null
): Promise<TrackInsight[]> {
  const auth = await resolveAuth();
  const [snapshot, tracking] = await Promise.all([
    track === "diet" ? getDietTrack(range, auth) : getWorkoutTrack(range, auth),
    getTrackingContext(date, auth),
  ]);
  try {
    const result = await completeJson<{ insights?: TrackInsight[] }>(
      buildProgressInsightsPrompt(track, snapshot, tracking),
      { maxTokens: 400 }
    );
    const list = (result.insights || []).filter((item) => item?.title && item.message).slice(0, 2);
    return list.length ? list : fallbackProgressInsights(track, snapshot, tracking);
  } catch {
    return fallbackProgressInsights(track, snapshot, tracking);
  }
}
