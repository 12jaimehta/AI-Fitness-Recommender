import { generateDietPlan } from "@backend/features/generate-diet";
import { jsonError, jsonOk, readJsonBody, sseResponse, wantsEventStream } from "@backend/shared";
import { getOptionalUser } from "@backend/shared/api/supabase";
import { setCurrentDiet } from "@backend/features/plan-cache";
import { requirePaidAfterFreePlan } from "@backend/features/billing";
import { dietPlanSchema } from "@/shared/validation/dietPlanSchema";

export const maxDuration = 120;
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const { user, supabase } = await getOptionalUser();
    if (user) {
      await requirePaidAfterFreePlan("diet", { auth: { user, supabase } });
    }
    const parsed = dietPlanSchema.safeParse(body);

    if (!wantsEventStream(request)) {
      const plan = await generateDietPlan(body);
      if (user && parsed.success) {
        await setCurrentDiet(user.id, { formData: parsed.data, plan });
      }
      return jsonOk(plan);
    }

    return sseResponse(async (send) => {
      const plan = await generateDietPlan(body, {
        onThought: (text) => send({ type: "thought", text }),
      });
      if (user && parsed.success) {
        await setCurrentDiet(user.id, { formData: parsed.data, plan });
      }
      send({ type: "done", plan });
    });
  } catch (error) {
    return jsonError(error);
  }
}
