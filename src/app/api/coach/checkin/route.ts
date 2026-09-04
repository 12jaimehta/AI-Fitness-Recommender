import { checkin } from "@backend/features/coach";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as Parameters<typeof checkin>[0];
    const data = await checkin(body);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
