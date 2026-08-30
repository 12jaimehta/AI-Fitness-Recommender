import { generateWorkoutPlan } from "@backend/features/generate-workout";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const plan = await generateWorkoutPlan(body);
    return jsonOk(plan);
  } catch (error) {
    return jsonError(error);
  }
}
