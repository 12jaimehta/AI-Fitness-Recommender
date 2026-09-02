import { getOptionalUser, requireUser } from "@backend/shared/api/supabase";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import {
  clearUserCache,
  getCurrentDiet,
  getCurrentWorkout,
  setCurrentDiet,
  setCurrentWorkout,
  type CachedDietSession,
  type CachedWorkoutSession,
} from "@backend/features/plan-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { supabase, user } = await getOptionalUser();
    if (!user) return jsonOk({ diet: null, workout: null });
    const auth = { supabase, user };
    const [diet, workout] = await Promise.all([
      getCurrentDiet(user.id, auth),
      getCurrentWorkout(user.id, auth),
    ]);
    return jsonOk({ diet, workout });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE() {
  try {
    const { user } = await requireUser();
    await clearUserCache(user.id);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const { user } = await getOptionalUser();
    if (!user) return jsonOk({ success: false });
    const body = (await readJsonBody(request)) as {
      diet?: CachedDietSession | null;
      workout?: CachedWorkoutSession | null;
    };
    if (body.diet?.plan) await setCurrentDiet(user.id, body.diet);
    if (body.workout?.plan) await setCurrentWorkout(user.id, body.workout);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
