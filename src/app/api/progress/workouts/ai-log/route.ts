import { aiLogWorkout } from "@backend/features/progress/workouts-log";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { date?: string; text_prompt?: string };
    const data = await aiLogWorkout(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
