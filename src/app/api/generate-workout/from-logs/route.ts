import { advanceWorkoutFromLogs } from "@backend/features/advance-plans";
import { jsonError, jsonOk } from "@backend/shared";

export const maxDuration = 120;

export async function POST() {
  try {
    const result = await advanceWorkoutFromLogs();
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
