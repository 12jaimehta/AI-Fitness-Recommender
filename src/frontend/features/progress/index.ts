import { api } from "@frontend/shared/api/http";
import { localIsoDate } from "@/shared/lib/plan-tracking";
import type {
  CurrentPlans,
  DailyProgress,
  ExerciseLogEntry,
  ProgressAnalytics,
  UserProfile,
  WeeklyReview,
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
} from "@/shared/types";

export async function getUserProfile() {
  const { data } = await api<{ data: UserProfile | null }>("/api/progress/profile");
  return data;
}

export async function createUserProfile(profile: Omit<UserProfile, "created_at" | "updated_at">) {
  const { data } = await api<{ data: UserProfile }>("/api/progress/profile", {
    method: "POST",
    body: JSON.stringify(profile),
  });
  return data;
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  const { data } = await api<{ data: UserProfile }>("/api/progress/profile", {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
  return data;
}

export async function getCurrentPlans(date = localIsoDate()) {
  const { data } = await api<{ data: CurrentPlans }>(`/api/current/plans?date=${date}`);
  return data;
}

export async function getDailyProgress(date = localIsoDate()) {
  const { data } = await api<{ data: DailyProgress }>(`/api/progress/daily?date=${date}`);
  return data;
}

export async function quickCheckMeal(meal_slot: string, date = localIsoDate()) {
  return api("/api/progress/meals/quick-check", {
    method: "POST",
    body: JSON.stringify({ date, meal_slot }),
  });
}

export async function aiLogMeal(text_prompt: string, meal_slot: string, date = localIsoDate()) {
  const { data } = await api<{ data: unknown }>("/api/progress/meals/ai-log", {
    method: "POST",
    body: JSON.stringify({ date, meal_slot, input_type: "text", text_prompt }),
  });
  return data;
}

export async function quickCheckWorkout(
  extra: { rpe_rating?: number; duration_minutes?: number; notes?: string } = {},
  date = localIsoDate()
) {
  return api("/api/progress/workouts/quick-check", {
    method: "POST",
    body: JSON.stringify({ date, ...extra }),
  });
}

export async function aiLogWorkout(text_prompt: string, date = localIsoDate()) {
  const { data } = await api<{ data: unknown }>("/api/progress/workouts/ai-log", {
    method: "POST",
    body: JSON.stringify({ date, text_prompt }),
  });
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
  const { data } = await api<{ data: unknown }>("/api/progress/workouts/log", {
    method: "POST",
    body: JSON.stringify({ date: payload.date || localIsoDate(), ...payload }),
  });
  return data;
}

export async function saveVitals(payload: {
  date?: string;
  weight_kg?: number | null;
  water_increment_ml?: number;
  sleep_hours?: number | null;
  energy_rating?: number | null;
}) {
  return api("/api/progress/metrics", {
    method: "POST",
    body: JSON.stringify({ date: payload.date || localIsoDate(), ...payload }),
  });
}

export async function getProgressAnalytics(range: string) {
  const { data } = await api<{ data: ProgressAnalytics }>(`/api/progress/analytics?range=${range}`);
  return data;
}

export async function getWeeklyReview() {
  const { data } = await api<{ data: WeeklyReview }>("/api/progress/ai-insights/weekly-review", {
    method: "POST",
    body: JSON.stringify({}),
  });
  return data;
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
