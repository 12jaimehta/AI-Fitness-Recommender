import { logPlanWorkout } from "@backend/features/progress";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { dayKey?: string; date?: string; logged?: boolean };
    const data = await logPlanWorkout(body);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}