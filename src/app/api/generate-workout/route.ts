import { generateWorkoutPlan } from "@backend/features/generate-workout";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import { getOptionalUser } from "@backend/shared/api/supabase";
import { setCurrentWorkout } from "@backend/features/plan-cache";
import { workoutPlanSchema } from "@/shared/validation/workoutPlanSchema";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const plan = await generateWorkoutPlan(body);
    const { user } = await getOptionalUser();
    const parsed = workoutPlanSchema.safeParse(body);
    if (user && parsed.success) {
      await setCurrentWorkout(user.id, { formData: parsed.data, plan });
    }
    return jsonOk(plan);
  } catch (error) {
    return jsonError(error);
  }
}
