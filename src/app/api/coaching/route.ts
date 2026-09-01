import { getCoachingAdvice } from "@backend/features/coaching";
import { jsonError, jsonOk } from "@backend/shared";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const force = new URL(request.url).searchParams.get("refresh") === "1";
    const data = await getCoachingAdvice(force);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
