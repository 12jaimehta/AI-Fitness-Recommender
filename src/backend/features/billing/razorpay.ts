import { createHmac, timingSafeEqual } from "crypto";
import { getRazorpayEnv } from "@backend/shared/config/env";
import { ApiError } from "@backend/shared/lib/errors";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

function authHeader() {
  const { keyId, keySecret, configured } = getRazorpayEnv();
  if (!configured) {
    throw new ApiError("Payments are not configured yet. Add Razorpay keys — see documentation/keys.md.", 503);
  }
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

export async function razorpayCreateOrder(input: {
  amountPaise: number;
  receipt: string;
  notes: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!Number.isFinite(input.amountPaise) || input.amountPaise < 100) {
    throw new ApiError("Amount must be at least 100 paise.", 400);
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      payment_capture: 1,
      notes: input.notes,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as RazorpayOrder & { error?: { description?: string } };
  if (response.status === 401 || response.status === 403) {
    throw new ApiError("Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.", 401);
  }
  if (!response.ok || !payload.id) {
    throw new ApiError(payload.error?.description || "Razorpay could not create the order.", 500);
  }
  return payload;
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const { keySecret, configured } = getRazorpayEnv();
  if (!configured) {
    throw new ApiError("Payments are not configured yet.", 503);
  }
  const expected = createHmac("sha256", keySecret).update(`${input.orderId}|${input.paymentId}`).digest("hex");
  return safeEqual(expected, input.signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const { webhookSecret } = getRazorpayEnv();
  if (!webhookSecret) {
    throw new ApiError("Webhook secret is missing.", 503);
  }
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
