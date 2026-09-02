import { getProfile, getTrackingContext, updateProfile, upsertProfile } from "@backend/features/progress";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import { requireUser } from "@backend/shared/api/supabase";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    const includeTracking = url.searchParams.get("tracking") === "1";
    const auth = await requireUser();
    const data = await getProfile(auth);
    if (!includeTracking) return jsonOk({ data });
    const tracking = await getTrackingContext(date, auth);
    return jsonOk({ data, tracking });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    const data = await upsertProfile(body as Parameters<typeof upsertProfile>[0]);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await readJsonBody(request);
    const data = await updateProfile(body as object);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
