import { generateDietPlan } from "@backend/features/generate-diet";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const plan = await generateDietPlan(body);
    return jsonOk(plan);
  } catch (error) {
    return jsonError(error);
  }
}
