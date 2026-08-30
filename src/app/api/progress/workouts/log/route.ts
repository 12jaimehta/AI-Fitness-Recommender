import { saveWorkoutLog } from "@backend/features/progress/workouts-log";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const data = await saveWorkoutLog(body as Parameters<typeof saveWorkoutLog>[0]);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
