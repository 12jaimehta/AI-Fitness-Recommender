import { aiLogMeal } from "@backend/features/progress/meals";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      date?: string;
      meal_slot?: string;
      input_type?: string;
      text_prompt?: string;
    };
    const data = await aiLogMeal(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
