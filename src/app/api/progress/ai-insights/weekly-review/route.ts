import { getWeeklyReview } from "@backend/features/progress/weekly";
import { jsonError, jsonOk } from "@backend/shared";

export async function POST() {
  try {
    const data = await getWeeklyReview();
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
