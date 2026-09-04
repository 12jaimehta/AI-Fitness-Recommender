import { generateWorkoutPlan } from "@backend/features/generate-workout";
import { jsonError, jsonOk, readJsonBody, sseResponse, wantsEventStream } from "@backend/shared";
import { getOptionalUser } from "@backend/shared/api/supabase";
import { setCurrentWorkout } from "@backend/features/plan-cache";
import { requirePaidAfterFreePlan } from "@backend/features/billing";
import { workoutPlanSchema } from "@/shared/validation/workoutPlanSchema";

export const maxDuration = 120;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const { user, supabase } = await getOptionalUser();
    if (user) {
      await requirePaidAfterFreePlan("workout", { auth: { user, supabase } });
    }
    const parsed = workoutPlanSchema.safeParse(body);

    if (!wantsEventStream(request)) {
      const plan = await generateWorkoutPlan(body);
      if (user && parsed.success) {
        await setCurrentWorkout(user.id, { formData: parsed.data, plan });
      }
      return jsonOk(plan);
    }

    return sseResponse(async (send) => {
      const plan = await generateWorkoutPlan(body, {
        onThought: (text) => send({ type: "thought", text }),
      });
      if (user && parsed.success) {
        await setCurrentWorkout(user.id, { formData: parsed.data, plan });
      }
      send({ type: "done", plan });
    });
  } catch (error) {
    return jsonError(error);
  }
}
