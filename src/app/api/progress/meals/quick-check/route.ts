import { quickCheckMeal } from "@backend/features/progress/meals";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { date?: string; meal_slot?: string };
    const result = await quickCheckMeal(body);
    return jsonOk({ success: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
