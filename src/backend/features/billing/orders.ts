import { resolveAuth } from "@backend/shared/api/supabase";
import { getRazorpayEnv } from "@backend/shared/config/env";
import { ApiError } from "@backend/shared/lib/errors";
import type { BillingOrder } from "@/shared/types/billing";
import { loadActivePlan, getMembershipView, grantMembership } from "./membership";
import { razorpayCreateOrder, verifyCheckoutSignature } from "./razorpay";

export async function createBillingOrder(): Promise<BillingOrder> {
  const auth = await resolveAuth();
  const razorpay = getRazorpayEnv();
  if (!razorpay.configured) {
    throw new ApiError("Add RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID) and RAZORPAY_KEY_SECRET to take payments.", 503);
  }

  const planRow = await auth.supabase
    .from("billing_plans")
    .select("id, slug, name, amount_paise, period_days")
    .eq("slug", "coach-30")
    .eq("active", true)
    .maybeSingle();
  if (planRow.error) {
    throw new ApiError(
      /does not exist|schema cache/i.test(planRow.error.message)
        ? "Paste supabase/schema/12_billing.sql in the Supabase SQL editor first."
        : planRow.error.message,
      400
    );
  }
  if (!planRow.data) throw new ApiError("No active billing plan.", 500);

  const receipt = `fyte_${auth.user.id.replace(/-/g, "").slice(0, 12)}_${Date.now().toString(36)}`.slice(0, 40);
  const order = await razorpayCreateOrder({
    amountPaise: planRow.data.amount_paise,
    receipt,
    notes: { user_id: auth.user.id, plan: planRow.data.slug },
  });

  const { error } = await auth.supabase.from("payments").insert({
    user_id: auth.user.id,
    billing_plan_id: planRow.data.id,
    razorpay_order_id: order.id,
    amount_paise: planRow.data.amount_paise,
    currency: "INR",
    status: "created",
    raw: { receipt },
  });
  if (error) throw new ApiError(error.message, 500);

  const plan = await loadActivePlan(auth);
  const name = String(auth.user.user_metadata?.full_name || auth.user.email?.split("@")[0] || "");
  return {
    orderId: order.id,
    keyId: razorpay.keyId,
    amountPaise: planRow.data.amount_paise,
    currency: "INR",
    name: "fyteAI",
    description: `${plan.name} — ${plan.periodDays} days`,
    prefill: { name, email: auth.user.email || "" },
  };
}

export async function verifyBillingPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const auth = await resolveAuth();
  const orderId = String(input.razorpay_order_id || "");
  const paymentId = String(input.razorpay_payment_id || "");
  const signature = String(input.razorpay_signature || "");
  if (!orderId || !paymentId || !signature) {
    throw new ApiError("Missing payment details.", 400);
  }
  if (!verifyCheckoutSignature({ orderId, paymentId, signature })) {
    throw new ApiError("Payment signature did not match.", 400);
  }

  const { data: row } = await auth.supabase
    .from("payments")
    .select("id")
    .eq("razorpay_order_id", orderId)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!row) throw new ApiError("That order is not yours.", 403);

  await grantMembership({
    userId: auth.user.id,
    orderId,
    paymentId,
    raw: { source: "checkout_verify", signature: true },
  });

  return getMembershipView(auth);
}
