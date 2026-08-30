import { getDailyProgress } from "@backend/features/progress/daily";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const data = await getDailyProgress(date);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
