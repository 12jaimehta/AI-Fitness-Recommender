import { getDietTrack, parseTrackRange } from "@backend/features/progress";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const range = parseTrackRange(new URL(request.url).searchParams.get("range"));
    const data = await getDietTrack(range);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
