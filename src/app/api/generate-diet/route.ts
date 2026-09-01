import { generateDietPlan } from "@backend/features/generate-diet";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import { getOptionalUser } from "@backend/shared/api/supabase";
import { setCurrentDiet } from "@backend/features/plan-cache";
import { dietPlanSchema } from "@/shared/validation/dietPlanSchema";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const plan = await generateDietPlan(body);
    const { user } = await getOptionalUser();
    const parsed = dietPlanSchema.safeParse(body);
    if (user && parsed.success) {
      await setCurrentDiet(user.id, { formData: parsed.data, plan });
    }
    return jsonOk(plan);
  } catch (error) {
    return jsonError(error);
  }
}
