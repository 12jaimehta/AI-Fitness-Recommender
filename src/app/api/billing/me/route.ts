import { getMembershipView } from "@backend/features/billing";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET() {
  try {
    const data = await getMembershipView();
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
