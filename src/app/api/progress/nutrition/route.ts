import { getNutrition, logDietMeal } from "@backend/features/progress";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const date =
      new URL(request.url).searchParams.get("date") ||
      new Date().toISOString().split("T")[0];
    const data = await getNutrition(date);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { slot?: string; date?: string; logged?: boolean };
    const data = await logDietMeal(body);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}