import { getTrackInsights, parseTrackRange } from "@backend/features/progress";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import { ApiError } from "@backend/shared/lib/errors";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { track?: string; range?: string; date?: string };
    const track = body.track === "workout" ? "workout" : body.track === "diet" ? "diet" : null;
    if (!track) throw new ApiError("track must be diet or workout", 400);
    const range = parseTrackRange(body.range || "month");
    const data = await getTrackInsights(track, range, body.date);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}