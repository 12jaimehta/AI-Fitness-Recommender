import { createBillingOrder } from "@backend/features/billing";
import { jsonError, jsonOk } from "@backend/shared";

export async function POST() {
  try {
    const data = await createBillingOrder();
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
