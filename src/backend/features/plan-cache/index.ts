import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { DietPlanData, WorkoutPlanData } from "@/shared/types";
import { cacheDel, cacheGet, cacheSet, clearUserCache, dropCoachingCache, userCacheKeys } from "@backend/shared/lib/redis";
import { getLatestDietPlan, getLatestWorkoutPlan } from "@backend/features/progress/plans";

export type CachedDietSession = {
  formData: DietPlanFormData;
  plan: DietPlanData;
  id?: string;
  title?: string;
};

export type CachedWorkoutSession = {
  formData: WorkoutPlanFormData;
  plan: WorkoutPlanData;
  id?: string;
  title?: string;
};

export { clearUserCache };

export async function setCurrentDiet(userId: string, session: CachedDietSession) {
  await cacheSet(userCacheKeys(userId).diet, session);
  await dropCoachingCache(userId);
}

export async function setCurrentWorkout(userId: string, session: CachedWorkoutSession) {
  await cacheSet(userCacheKeys(userId).workout, session);
  await dropCoachingCache(userId);
}

export async function getCurrentDiet(userId: string): Promise<CachedDietSession | null> {
  const cached = await cacheGet<CachedDietSession>(userCacheKeys(userId).diet);
  if (cached?.plan) return cached;
  return recacheDietFromDb(userId);
}

export async function getCurrentWorkout(userId: string): Promise<CachedWorkoutSession | null> {
  const cached = await cacheGet<CachedWorkoutSession>(userCacheKeys(userId).workout);
  if (cached?.plan) return cached;
  return recacheWorkoutFromDb(userId);
}

export async function recacheDietFromDb(userId: string): Promise<CachedDietSession | null> {
  const row = await getLatestDietPlan();
  if (!row?.diet_plan || !row.form_data) return null;
  const session: CachedDietSession = {
    formData: row.form_data as DietPlanFormData,
    plan: row.diet_plan,
    id: row.id,
    title: row.title,
  };
  await setCurrentDiet(userId, session);
  return session;
}

export async function recacheWorkoutFromDb(userId: string): Promise<CachedWorkoutSession | null> {
  const row = await getLatestWorkoutPlan();
  if (!row?.workout_plan || !row.form_data) return null;
  const session: CachedWorkoutSession = {
    formData: row.form_data as WorkoutPlanFormData,
    plan: row.workout_plan,
    id: row.id,
    title: row.title,
  };
  await setCurrentWorkout(userId, session);
  return session;
}

export async function recacheUserPlans(userId: string) {
  await Promise.all([recacheDietFromDb(userId), recacheWorkoutFromDb(userId)]);
}

export async function dropDietCache(userId: string) {
  await cacheDel(userCacheKeys(userId).diet);
}

export async function dropWorkoutCache(userId: string) {
  await cacheDel(userCacheKeys(userId).workout);
}
