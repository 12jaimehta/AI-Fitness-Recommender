import { advanceDietFromLogs } from "@backend/features/advance-plans";
import { jsonError, jsonOk } from "@backend/shared";

export const maxDuration = 120;

export async function POST() {
  try {
    const result = await advanceDietFromLogs();
    return jsonOk(result);
  } catch (error) {
    return jsonError(error);
  }
}
