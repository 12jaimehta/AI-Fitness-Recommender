import { quickCheckWorkout } from "@backend/features/progress/workouts-log";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      date?: string;
      rpe_rating?: number;
      duration_minutes?: number;
      notes?: string;
    };
    const result = await quickCheckWorkout(body);
    return jsonOk({ success: true, ...result });
  } catch (error) {
    return jsonError(error);
  }
}
