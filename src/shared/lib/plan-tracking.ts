import type {
  DailyMeals,
  DailyWorkout,
  DietPlanData,
  LoggedMeal,
  MealData,
  TrackMealOption,
  TrackWorkoutSession,
  TrackingContext,
  TrackingDiet,
  TrackingWorkout,
  WorkoutPlanData,
} from "@/shared/types";

export const PLAN_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type PlanDayKey = (typeof PLAN_DAYS)[number];

const WEEKDAY_FROM_UTC_DAY = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const MEAL_SLOT_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snack",
  morningSnack: "Morning snack",
  eveningSnack: "Evening snack",
  afternoonSnack: "Afternoon snack",
  beforeBed: "Before bed",
  snack1: "Snack",
  snack2: "Snack 2",
};

const MEALS_BY_COUNT: Record<number, string[]> = {
  3: ["breakfast", "lunch", "dinner"],
  4: ["breakfast", "lunch", "dinner", "snacks"],
  5: ["breakfast", "morningSnack", "lunch", "eveningSnack", "dinner"],
  6: ["breakfast", "morningSnack", "lunch", "afternoonSnack", "eveningSnack", "dinner"],
};

export function localIsoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Civil-date arithmetic on YYYY-MM-DD (timezone-safe). */
export function addDaysIso(iso: string, days: number) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

export function eachIsoDate(from: string, to: string) {
  const dates: string[] = [];
  if (from > to) return dates;
  for (let cur = from; cur <= to; cur = addDaysIso(cur, 1)) {
    dates.push(cur);
    if (dates.length > 400) break;
  }
  return dates;
}

export function parseIsoDate(value: string | null | undefined, fallback: string) {
  const match = String(value ?? "").trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : fallback;
}

export function weekdayFromIsoDate(iso: string): PlanDayKey {
  const [year, month, day] = iso.split("-").map(Number);
  const key = WEEKDAY_FROM_UTC_DAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return key as PlanDayKey;
}

export function weekStartMonday(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const offset = weekday === 0 ? 6 : weekday - 1;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

export function parseLeadingNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const nums = String(value ?? "").match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return fallback;
  if (nums.length >= 2) {
    return Math.round((Number(nums[0]) + Number(nums[1])) / 2);
  }
  return Math.round(Number(nums[0]));
}

export function parseDurationMinutes(value: unknown, fallback = 0) {
  const nums = String(value ?? "").match(/\d+/g);
  if (!nums?.length) return fallback;
  return Number(nums[0]);
}

export function mealsPerDayFromForm(formData: { mealsPerDay?: string | number } | null | undefined) {
  const n = parseInt(String(formData?.mealsPerDay ?? "4"), 10);
  if (n >= 3 && n <= 6) return n;
  return 4;
}

export function mealSlotLabel(slot: string) {
  if (MEAL_SLOT_LABELS[slot]) return MEAL_SLOT_LABELS[slot];
  return slot.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function normalizeDayKey(value: string) {
  const text = value.trim().toLowerCase();
  if (text === "session") return "session";
  const match = PLAN_DAYS.find((day) => text === day || text.startsWith(day.slice(0, 3)));
  return match || text;
}

export function encodePlanNote(planId: string, dayKey: string) {
  return JSON.stringify({ source: "plan", plan_id: planId, day: dayKey });
}

export function parsePlanNote(notes: string | null | undefined) {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes) as { source?: string; plan_id?: string; day?: string };
    if (parsed?.source === "plan" && typeof parsed.day === "string") {
      return { planId: String(parsed.plan_id || ""), day: parsed.day };
    }
  } catch {
    return null;
  }
  return null;
}

export function asLoggedMeals(value: unknown): Record<string, LoggedMeal> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, LoggedMeal>;
}

export function sumLoggedMeals(meals: Record<string, LoggedMeal>) {
  return Object.values(meals).reduce(
    (sum, meal) => ({
      calories: sum.calories + Number(meal.calories || 0),
      protein: sum.protein + Number(meal.protein || 0),
      carbs: sum.carbs + Number(meal.carbs || 0),
      fats: sum.fats + Number(meal.fats || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
}

function mealMacros(meal: Partial<MealData> | undefined): LoggedMeal {
  const extra = meal as (Partial<MealData> & { fats?: number }) | undefined;
  return {
    name: String(meal?.name || "").trim(),
    calories: parseLeadingNumber(meal?.calories),
    protein: parseLeadingNumber(meal?.protein),
    carbs: toNumber(meal?.carbs),
    fats: parseLeadingNumber(extra?.fat ?? extra?.fats),
  };
}

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function dailyMealsForDate(plan: DietPlanData, isoDate: string): DailyMeals {
  const day = weekdayFromIsoDate(isoDate);
  const weekly = plan.weeklyPlan?.[day];
  if (weekly && Object.keys(weekly).length > 0) return weekly;
  return plan.meals || {};
}

function mealMap(dayMeals: DailyMeals | Record<string, MealData | undefined>) {
  const raw = { ...(dayMeals as Record<string, MealData | undefined>) };
  if (!raw.snacks && raw.snack1) raw.snacks = raw.snack1;
  return raw;
}

export function buildDietTrackMeals(
  dayMeals: DailyMeals | Record<string, MealData | undefined>,
  mealsPerDay: number,
  logged: Record<string, LoggedMeal> | null | undefined
): TrackMealOption[] {
  const raw = mealMap(dayMeals);
  const preferred = MEALS_BY_COUNT[mealsPerDay] || MEALS_BY_COUNT[4];
  const used = new Set<string>();
  const options: TrackMealOption[] = [];

  const push = (slot: string, meal: MealData | undefined) => {
    if (used.has(slot)) return;
    used.add(slot);
    const macros = mealMacros(meal);
    options.push({
      slot,
      label: mealSlotLabel(slot),
      ...macros,
      logged: Boolean(logged?.[slot]),
    });
  };

  for (const slot of preferred) {
    const meal = raw[slot];
    if (meal && (meal.name || meal.calories)) push(slot, meal);
  }

  if (options.length < mealsPerDay) {
    for (const [slot, meal] of Object.entries(raw)) {
      if (options.length >= mealsPerDay) break;
      if (!meal || (!meal.name && !meal.calories)) continue;
      push(slot, meal);
    }
  }

  if (options.length < mealsPerDay) {
    for (const slot of preferred) {
      if (options.length >= mealsPerDay) break;
      push(slot, raw[slot]);
    }
  }

  return options.slice(0, mealsPerDay);
}

export function plannedMealForSlot(
  dayMeals: DailyMeals | Record<string, MealData | undefined>,
  slot: string
): LoggedMeal | null {
  const meal = mealMap(dayMeals)[slot];
  if (!meal || (!meal.name && !meal.calories)) return null;
  return mealMacros(meal);
}

function restDaySet(plan: WorkoutPlanData) {
  return new Set((plan.recommendedRestDays || []).map((day) => normalizeDayKey(String(day))));
}

function isRestWorkout(day: DailyWorkout | undefined, dayKey: string, restDays: Set<string>) {
  if (restDays.has(dayKey)) return true;
  if (!day) return true;
  const title = String(day.day || "").toLowerCase();
  if (title.includes("rest")) return true;
  return !day.exercises?.length;
}

function sessionFromDaily(
  dayKey: string,
  day: DailyWorkout | undefined,
  plan: WorkoutPlanData,
  durationFallback: number,
  todayKey: string,
  loggedDays: Set<string>
): TrackWorkoutSession {
  const restDays = restDaySet(plan);
  const isRest = dayKey !== "session" && isRestWorkout(day, dayKey, restDays);
  const muscles = isRest ? [] : day?.muscleGroups || [];
  const label = isRest
    ? "Rest"
    : (day?.day && String(day.day).trim()) ||
      (muscles.length ? muscles.join(", ") : dayKey === "session" ? "Today's workout" : capitalize(dayKey));

  return {
    dayKey,
    label,
    muscleGroups: muscles,
    durationMinutes: isRest ? 0 : parseDurationMinutes(day?.duration, durationFallback),
    estimatedCalories: isRest
      ? 0
      : parseLeadingNumber(day?.estimatedCalories, parseLeadingNumber(plan.estimatedCaloriesBurn)),
    exercises: isRest ? [] : (day?.exercises || []).slice(0, 8).map((item) => item.name).filter(Boolean),
    isToday: dayKey === "session" || dayKey === todayKey,
    isRest,
    logged: loggedDays.has(dayKey),
  };
}

export function buildWorkoutTrackSessions(
  plan: WorkoutPlanData,
  formData: { workoutDuration?: string | number } | null | undefined,
  todayKey: string,
  loggedDays: Set<string>
): TrackWorkoutSession[] {
  const durationFallback = parseDurationMinutes(formData?.workoutDuration, 45);

  if (plan.weeklyPlan) {
    return PLAN_DAYS.map((dayKey) =>
      sessionFromDaily(dayKey, plan.weeklyPlan?.[dayKey], plan, durationFallback, todayKey, loggedDays)
    );
  }

  if (plan.singleWorkout) {
    return [sessionFromDaily("session", plan.singleWorkout, plan, durationFallback, todayKey, loggedDays)];
  }

  return [];
}

export function emptyTracking(date: string): TrackingContext {
  const todayKey = weekdayFromIsoDate(date);
  return {
    date,
    diet: emptyDiet(),
    workout: emptyWorkout(todayKey),
  };
}

export function emptyDiet(): TrackingDiet {
  return {
    hasPlan: false,
    planId: null,
    title: null,
    mealsPerDay: 0,
    calorieTarget: 0,
    proteinTarget: 0,
    carbTarget: 0,
    fatTarget: 0,
    meals: [],
    loggedCount: 0,
    todayCalories: 0,
  };
}

export function emptyWorkout(todayKey: string): TrackingWorkout {
  return {
    hasPlan: false,
    planId: null,
    title: null,
    frequency: 0,
    todayKey,
    isRestDay: true,
    sessions: [],
    loggedToday: [],
    sessionsThisWeek: 0,
    todayCalories: 0,
  };
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
