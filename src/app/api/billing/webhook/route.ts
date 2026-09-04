import { handleBillingWebhook } from "@backend/features/billing";
import { jsonError, jsonOk } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const raw = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const data = await handleBillingWebhook(raw, signature);
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
