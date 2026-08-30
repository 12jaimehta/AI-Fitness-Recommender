import { getProfile, getTrackingContext, updateProfile, upsertProfile } from "@backend/features/progress";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const date = new URL(request.url).searchParams.get("date");
    const [data, tracking] = await Promise.all([getProfile(), getTrackingContext(date)]);
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