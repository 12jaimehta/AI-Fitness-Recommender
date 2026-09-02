import type { CurrentPlans } from "@/shared/types/progress-tracking";
import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { parseIsoDate } from "@/shared/lib/plan-tracking";
import { mapDietPlan, mapWorkoutPlan } from "@/shared/lib/current-plans";
import { getCurrentDiet, getCurrentWorkout } from "@backend/features/plan-cache";
import { utcToday } from "./db";

export async function getCurrentPlans(dateInput?: string | null, auth?: AuthCtx): Promise<CurrentPlans> {
  const resolved = await resolveAuth(auth);
  const date = parseIsoDate(dateInput, utcToday());
  const [diet, workout] = await Promise.all([
    getCurrentDiet(resolved.user.id, resolved),
    getCurrentWorkout(resolved.user.id, resolved),
  ]);

  return {
    diet_plan: diet
      ? mapDietPlan(
          {
            id: diet.id || "current-diet",
            title: diet.title || "Diet plan",
            form_data: diet.formData,
            diet_plan: diet.plan,
          },
          date
        )
      : null,
    workout_plan: workout
      ? mapWorkoutPlan(
          {
            id: workout.id || "current-workout",
            title: workout.title || "Workout plan",
            form_data: workout.formData,
            workout_plan: workout.plan,
          },
          date
        )
      : null,
  };
}
