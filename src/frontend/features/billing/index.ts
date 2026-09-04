import { api, ApiRequestError } from "@frontend/shared/api/http";
import type { BillingOrder, MembershipView } from "@/shared/types/billing";

export function redirectIfPaywall(err: unknown) {
  if (err instanceof ApiRequestError && (err.status === 402 || err.code === "membership_required")) {
    if (typeof window !== "undefined") {
      // Service modules cannot use useRouter; this only runs after a paid API 402.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/billing");
    }
    return true;
  }
  return false;
}

export async function getMembership() {
  const { data } = await api<{ data: MembershipView }>("/api/billing/me");
  return data;
}

export async function createMembershipOrder() {
  const { data } = await api<{ data: BillingOrder }>("/api/billing/order", { method: "POST" });
  return data;
}

export async function verifyMembershipPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  const { data } = await api<{ data: MembershipView }>("/api/billing/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}
