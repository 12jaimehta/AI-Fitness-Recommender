import { getTodayBoard } from "@backend/features/coach";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const data = await getTodayBoard(date);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
