import { startInterview } from "@backend/features/coach";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as Parameters<typeof startInterview>[0];
    const data = await startInterview(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
