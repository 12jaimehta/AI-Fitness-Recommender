export type BillingPlanView = {
  slug: string;
  name: string;
  amountPaise: number;
  amountLabel: string;
  currency: "INR";
  periodDays: number;
};

export type MembershipStatus = "none" | "active" | "past_due" | "canceled";

export type MembershipView = {
  active: boolean;
  status: MembershipStatus;
  currentPeriodEnd: string | null;
  plan: BillingPlanView;
  checkoutReady: boolean;
  setupRequired: boolean;
  setupMessage: string | null;
};

export type BillingOrder = {
  orderId: string;
  keyId: string;
  amountPaise: number;
  currency: "INR";
  name: string;
  description: string;
  prefill: { name: string; email: string };
};

export const MEMBERSHIP_REQUIRED = "membership_required";
export const COACH_PLAN_SLUG = "coach-30";
export const COACH_AMOUNT_PAISE = 29900;
export const COACH_PERIOD_DAYS = 30;

export function formatInrFromPaise(paise: number) {
  return `₹${Math.round(paise / 100)}`;
}
