import { getCurrentPlans } from "@backend/features/progress/current-plans";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const data = await getCurrentPlans(date);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
