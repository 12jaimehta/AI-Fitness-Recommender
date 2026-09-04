import { answerInterview } from "@backend/features/coach";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as Parameters<typeof answerInterview>[0];
    const data = await answerInterview(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
