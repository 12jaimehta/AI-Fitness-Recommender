import { api } from "@frontend/shared/api/http";
import { clampIsoDateToToday, isFutureIsoDate, localIsoDate } from "@/shared/lib/plan-tracking";
import { cachedQuery, invalidateQueryCache, setQueryCache } from "@frontend/shared/lib/query-cache";
import type {
  CurrentPlans,
  DailyProgress,
  ExerciseLogEntry,
  ProgressAnalytics,
  UserProfile,
  WeeklyReview,
  CoachingAdvice,
} from "@/shared/types";

export type {
  UserProfile,
  DailyProgress,
  CurrentPlans,
  CurrentDietPlan,
  CurrentWorkoutPlan,
  MealLogRow,
  WorkoutLogRow,
  ExerciseLogEntry,
  WorkoutSetEntry,
  ProgressAnalytics,
  WeeklyReview,
  CoachingAdvice,
} from "@/shared/types";

function bustLogs(date?: string) {
  const day = date || localIsoDate();
  invalidateQueryCache(`daily:${day}`);
  invalidateQueryCache("analytics:");
  invalidateQueryCache("weekly-review");
}

function requireLoggableDate(date?: string) {
  const day = date || localIsoDate();
  if (isFutureIsoDate(day)) {
    throw new Error("You can only log today or past days.");
  }
  return day;
}

export function seedDailyProgress(date: string, data: DailyProgress) {
  setQueryCache(`daily:${date}`, data, 30_000);
}

export function seedUserProfile(data: UserProfile | null) {
  setQueryCache("profile", data, 60_000);
}

export function seedProgressAnalytics(range: string, date: string, data: ProgressAnalytics) {
  setQueryCache(`analytics:${range}:${date}`, data, 30_000);
}

export async function getUserProfile() {
  return cachedQuery("profile", async () => {
    const { data } = await api<{ data: UserProfile | null }>("/api/progress/profile");
    return data;
  }, 60_000);
}

export async function createUserProfile(profile: Omit<UserProfile, "created_at" | "updated_at">) {
  const { data } = await api<{ data: UserProfile }>("/api/progress/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
  setQueryCache("profile", data, 60_000);
  return data;
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  const { data } = await api<{ data: UserProfile }>("/api/progress/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  setQueryCache("profile", data, 60_000);
  return data;
}

export async function getCurrentPlans(date = localIsoDate()) {
  const { data } = await api<{ data: CurrentPlans }>(`/api/current/plans?date=${date}`);
  return data;
}

export async function getDailyProgress(date = localIsoDate()) {
  const day = clampIsoDateToToday(date);
  return cachedQuery(`daily:${day}`, async () => {
    const { data } = await api<{ data: DailyProgress }>(`/api/progress/daily?date=${day}`);
    return data;
  });
}

export async function quickCheckMeal(meal_slot: string, date = localIsoDate()) {
  const day = requireLoggableDate(date);
  const result = await api("/api/progress/meals/quick-check", {
    method: "POST",
    body: JSON.stringify({ date: day, meal_slot }),
  });
  bustLogs(day);
  return result;
}

export async function aiLogMeal(text_prompt: string, meal_slot: string, date = localIsoDate()) {
  const day = requireLoggableDate(date);
  const { data } = await api<{ data: unknown }>("/api/progress/meals/ai-log", {
    method: "POST",
    body: JSON.stringify({ date: day, meal_slot, input_type: "text", text_prompt }),
  });
  bustLogs(day);
  return data;
}

export async function quickCheckWorkout(
  extra: { rpe_rating?: number; duration_minutes?: number; notes?: string } = {},
  date = localIsoDate()
) {
  const day = requireLoggableDate(date);
  const result = await api("/api/progress/workouts/quick-check", {
    method: "POST",
    body: JSON.stringify({ date: day, ...extra }),
  });
  bustLogs(day);
  return result;
}

export async function aiLogWorkout(text_prompt: string, date = localIsoDate()) {
  const day = requireLoggableDate(date);
  const { data } = await api<{ data: unknown }>("/api/progress/workouts/ai-log", {
    method: "POST",
    body: JSON.stringify({ date: day, text_prompt }),
  });
  bustLogs(day);
  return data;
}

export async function saveWorkoutLog(payload: {
  date?: string;
  exercises_completed?: ExerciseLogEntry[];
  duration_minutes?: number;
  rpe_rating?: number;
  is_completed?: boolean;
  notes?: string;
  title?: string;
}) {
  const date = requireLoggableDate(payload.date);
  const { data } = await api<{ data: unknown }>("/api/progress/workouts/log", {
    method: "POST",
    body: JSON.stringify({ date, ...payload }),
  });
  bustLogs(date);
  return data;
}

export async function saveVitals(payload: {
  date?: string;
  weight_kg?: number | null;
  water_increment_ml?: number;
  sleep_hours?: number | null;
  energy_rating?: number | null;
}) {
  const date = requireLoggableDate(payload.date);
  const result = await api("/api/progress/metrics", {
    method: "POST",
    body: JSON.stringify({ date, ...payload }),
  });
  bustLogs(date);
  if (payload.weight_kg != null) invalidateQueryCache("coaching");
  return result;
}

export async function getProgressAnalytics(range: string, date = localIsoDate()) {
  const day = clampIsoDateToToday(date);
  return cachedQuery(`analytics:${range}:${day}`, async () => {
    const { data } = await api<{ data: ProgressAnalytics }>(
      `/api/progress/analytics?range=${range}&date=${day}`
    );
    return data;
  });
}

export async function getWeeklyReview() {
  return cachedQuery("weekly-review", async () => {
    const { data } = await api<{ data: WeeklyReview }>("/api/progress/ai-insights/weekly-review", {
      method: "POST",
      body: JSON.stringify({}),
    });
    return data;
  }, 60_000);
}

export async function getCoachingAdvice(refresh = false) {
  if (refresh) invalidateQueryCache("coaching");
  return cachedQuery(
    "coaching",
    async () => {
      const { data } = await api<{ data: CoachingAdvice }>(
        refresh ? "/api/coaching?refresh=1" : "/api/coaching"
      );
      return data;
    },
    60_000
  );
}

/** @deprecated use named functions; kept for my-profile */
class DatabaseService {
  async getUserProfile(_userId: string) {
    return getUserProfile();
  }
  async createUserProfile(profile: Omit<UserProfile, "created_at" | "updated_at">) {
    return createUserProfile(profile);
  }
  async updateUserProfile(_userId: string, updates: Partial<UserProfile>) {
    return updateUserProfile(updates);
  }
}

export const databaseService = new DatabaseService();
