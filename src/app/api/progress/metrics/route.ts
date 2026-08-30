import { upsertVitals } from "@backend/features/progress/daily";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as Parameters<typeof upsertVitals>[0];
    const data = await upsertVitals(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
