import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { DietPlanData, WorkoutPlanData } from "@/shared/types";
import { cacheDel, cacheGet, cacheSet, clearUserCache, dropCoachingCache, userCacheKeys } from "@backend/shared/lib/redis";
import type { AuthCtx } from "@backend/shared/api/supabase";
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
  await Promise.all([cacheSet(userCacheKeys(userId).diet, session), dropCoachingCache(userId)]);
}

export async function setCurrentWorkout(userId: string, session: CachedWorkoutSession) {
  await Promise.all([cacheSet(userCacheKeys(userId).workout, session), dropCoachingCache(userId)]);
}

export async function getCurrentDiet(userId: string, auth?: AuthCtx): Promise<CachedDietSession | null> {
  const cached = await cacheGet<CachedDietSession>(userCacheKeys(userId).diet);
  if (cached?.plan) return cached;
  return recacheDietFromDb(userId, auth);
}

export async function getCurrentWorkout(userId: string, auth?: AuthCtx): Promise<CachedWorkoutSession | null> {
  const cached = await cacheGet<CachedWorkoutSession>(userCacheKeys(userId).workout);
  if (cached?.plan) return cached;
  return recacheWorkoutFromDb(userId, auth);
}

export async function recacheDietFromDb(userId: string, auth?: AuthCtx): Promise<CachedDietSession | null> {
  const row = await getLatestDietPlan(auth);
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

export async function recacheWorkoutFromDb(userId: string, auth?: AuthCtx): Promise<CachedWorkoutSession | null> {
  const row = await getLatestWorkoutPlan(auth);
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

export async function recacheUserPlans(userId: string, auth?: AuthCtx) {
  await Promise.all([recacheDietFromDb(userId, auth), recacheWorkoutFromDb(userId, auth)]);
}

export async function dropDietCache(userId: string) {
  await cacheDel(userCacheKeys(userId).diet);
}

export async function dropWorkoutCache(userId: string) {
  await cacheDel(userCacheKeys(userId).workout);
}
