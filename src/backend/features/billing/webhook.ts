import { ApiError } from "@backend/shared/lib/errors";
import { grantMembership } from "./membership";
import { verifyWebhookSignature } from "./razorpay";

type RazorpayWebhook = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
        notes?: Record<string, string>;
      };
    };
  };
};

export async function handleBillingWebhook(rawBody: string, signature: string | null) {
  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    throw new ApiError("Invalid webhook signature.", 400);
  }

  let body: RazorpayWebhook;
  try {
    body = JSON.parse(rawBody) as RazorpayWebhook;
  } catch {
    throw new ApiError("Invalid webhook body.", 400);
  }

  if (body.event !== "payment.captured") {
    return { ignored: true as const, event: body.event || "unknown" };
  }

  const payment = body.payload?.payment?.entity;
  const orderId = payment?.order_id || "";
  const paymentId = payment?.id || "";
  if (!orderId || !paymentId) {
    throw new ApiError("Webhook payment is missing order or payment id.", 400);
  }

  const method = payment?.method === "upi" || payment?.method === "card" ? payment.method : null;
  const result = await grantMembership({
    userId: payment?.notes?.user_id || "",
    orderId,
    paymentId,
    method,
    raw: { source: "webhook", event: body.event },
  });
  return { ignored: false as const, ...result };
}
