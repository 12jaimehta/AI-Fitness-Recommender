import { getProgressAnalytics } from "@backend/features/progress/analytics";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const range = new URL(request.url).searchParams.get("range") || "month";
    const data = await getProgressAnalytics(range);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
