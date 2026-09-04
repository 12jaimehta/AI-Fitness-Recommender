import { verifyBillingPayment } from "@backend/features/billing";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };
    const data = await verifyBillingPayment({
      razorpay_order_id: body.razorpay_order_id || "",
      razorpay_payment_id: body.razorpay_payment_id || "",
      razorpay_signature: body.razorpay_signature || "",
    });
    return jsonOk({ success: true, data });
  } catch (error) {
    return jsonError(error);
  }
}
