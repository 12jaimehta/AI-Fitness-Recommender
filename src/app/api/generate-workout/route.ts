import { generateWorkoutPlan } from "@backend/features/generate-workout";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import { getOptionalUser } from "@backend/shared/api/supabase";
import { setCurrentWorkout } from "@backend/features/plan-cache";
import { requirePaidAfterFreePlan } from "@backend/features/billing";
import { workoutPlanSchema } from "@/shared/validation/workoutPlanSchema";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const { user, supabase } = await getOptionalUser();
    if (user) {
      await requirePaidAfterFreePlan("workout", { auth: { user, supabase } });
    }
    const plan = await generateWorkoutPlan(body);
    const parsed = workoutPlanSchema.safeParse(body);
    if (user && parsed.success) {
      await setCurrentWorkout(user.id, { formData: parsed.data, plan });
    }
    return jsonOk(plan);
  } catch (error) {
    return jsonError(error);
  }
}
