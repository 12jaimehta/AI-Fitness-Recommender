import { createDietPlan, listDietPlans } from "@backend/features/diet-plans";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";
import type { DietPlanData } from "@/shared/types";

export async function GET() {
  try {
    const data = await listDietPlans();
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      formData: DietPlanFormData;
      dietPlan: DietPlanData;
      title?: string;
      description?: string;
    };
    const data = await createDietPlan(body);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
