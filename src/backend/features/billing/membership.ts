import type { AuthCtx } from "@backend/shared/api/supabase";
import { resolveAuth } from "@backend/shared/api/supabase";
import { createServiceSupabase } from "@backend/shared/api/supabase-admin";
import { getRazorpayEnv, getServiceRoleKey } from "@backend/shared/config/env";
import { getCurrentDiet, getCurrentWorkout } from "@backend/features/plan-cache";
import { ApiError } from "@backend/shared/lib/errors";
import {
  COACH_AMOUNT_PAISE,
  COACH_PERIOD_DAYS,
  COACH_PLAN_SLUG,
  MEMBERSHIP_REQUIRED,
  formatInrFromPaise,
  type BillingPlanView,
  type MembershipStatus,
  type MembershipView,
} from "@/shared/types/billing";

const FALLBACK_PLAN: BillingPlanView = {
  slug: COACH_PLAN_SLUG,
  name: "Coach",
  amountPaise: COACH_AMOUNT_PAISE,
  amountLabel: formatInrFromPaise(COACH_AMOUNT_PAISE),
  currency: "INR",
  periodDays: COACH_PERIOD_DAYS,
};

export function isBillingSchemaMissing(error: unknown) {
  const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error || "");
  return /12_billing\.sql|billing_plans|memberships|does not exist|schema cache|could not find the table/i.test(message);
}

function throwIfBillingSchemaMissing(error: { message?: string } | null) {
  if (!error) return;
  const message = error.message || "";
  if (/does not exist|schema cache|could not find the table/i.test(message)) {
    throw new ApiError("Paste supabase/schema/12_billing.sql in the Supabase SQL editor, then open Billing again.", 400);
  }
}

export function catalogPlan(): BillingPlanView {
  return FALLBACK_PLAN;
}

export async function loadActivePlan(auth: AuthCtx): Promise<BillingPlanView> {
  const { data, error } = await auth.supabase
    .from("billing_plans")
    .select("slug, name, amount_paise, currency, period_days")
    .eq("slug", COACH_PLAN_SLUG)
    .eq("active", true)
    .maybeSingle();
  throwIfBillingSchemaMissing(error);
  if (error) throw new ApiError(error.message, 500);
  if (!data) return FALLBACK_PLAN;
  return {
    slug: data.slug,
    name: data.name,
    amountPaise: data.amount_paise,
    amountLabel: formatInrFromPaise(data.amount_paise),
    currency: "INR",
    periodDays: data.period_days,
  };
}

export async function hasActiveMembership(auth: AuthCtx) {
  const { data, error } = await auth.supabase
    .from("memberships")
    .select("status, current_period_end")
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (error) {
    if (isBillingSchemaMissing(error)) return false;
    throw new ApiError(error.message, 500);
  }
  if (!data) return false;
  if (data.status !== "active" || !data.current_period_end) return false;
  return new Date(data.current_period_end).getTime() > Date.now();
}

export async function getMembershipView(auth?: AuthCtx): Promise<MembershipView> {
  const ctx = await resolveAuth(auth);
  const checkoutReady = getRazorpayEnv().configured && Boolean(getServiceRoleKey());
  try {
    const plan = await loadActivePlan(ctx);
    const { data, error } = await ctx.supabase
      .from("memberships")
      .select("status, current_period_end")
      .eq("user_id", ctx.user.id)
      .maybeSingle();
    throwIfBillingSchemaMissing(error);
    if (error) throw new ApiError(error.message, 500);
    const periodEnd = data?.current_period_end || null;
    const active = data?.status === "active" && Boolean(periodEnd) && new Date(periodEnd).getTime() > Date.now();
    return {
      active,
      status: (data?.status as MembershipStatus) || "none",
      currentPeriodEnd: periodEnd,
      plan,
      checkoutReady,
      setupRequired: false,
      setupMessage: null,
    };
  } catch (error) {
    if (isBillingSchemaMissing(error)) {
      return {
        active: false,
        status: "none",
        currentPeriodEnd: null,
        plan: FALLBACK_PLAN,
        checkoutReady: false,
        setupRequired: true,
        setupMessage: error instanceof Error ? error.message : "Paste 12_billing.sql to turn payments on.",
      };
    }
    throw error;
  }
}

/** Paid coach writes. No-ops the gate until Razorpay keys exist so we don't lock the product before KYC. */
export async function requirePaidCoach(auth?: AuthCtx) {
  const ctx = await resolveAuth(auth);
  if (!getRazorpayEnv().configured || !getServiceRoleKey()) return ctx;
  const membership = await getMembershipView(ctx);
  if (membership.setupRequired) return ctx;
  if (membership.active) return ctx;
  throw new ApiError("Unlock the coach to log a different meal, swap a slot, or rebuild from the week.", 402, {
    code: MEMBERSHIP_REQUIRED,
    href: "/billing",
  });
}

async function countUserPlans(auth: AuthCtx, table: "diet_plans" | "workout_plans") {
  const { count, error } = await auth.supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);
  if (error) throw new ApiError(error.message, 500);
  return count || 0;
}

async function hasUsedFreePlan(auth: AuthCtx, kind: "diet" | "workout", forSave: boolean) {
  if (kind === "diet") {
    if (!forSave) {
      const current = await getCurrentDiet(auth.user.id, auth);
      if (current?.plan) return true;
    }
    return (await countUserPlans(auth, "diet_plans")) > 0;
  }
  if (!forSave) {
    const current = await getCurrentWorkout(auth.user.id, auth);
    if (current?.plan) return true;
  }
  return (await countUserPlans(auth, "workout_plans")) > 0;
}

/** First diet and first workout stay free. A second generate or save needs the 30-day pass. */
export async function requirePaidAfterFreePlan(
  kind: "diet" | "workout",
  options?: { auth?: AuthCtx; forSave?: boolean }
) {
  const ctx = await resolveAuth(options?.auth);
  if (!getRazorpayEnv().configured || !getServiceRoleKey()) return ctx;
  const membership = await getMembershipView(ctx);
  if (membership.setupRequired || membership.active) return ctx;
  if (!(await hasUsedFreePlan(ctx, kind, Boolean(options?.forSave)))) return ctx;
  const noun = kind === "diet" ? "diet" : "workout";
  throw new ApiError(`Your first ${noun} plan is free. Take the 30-day pass to make another.`, 402, {
    code: MEMBERSHIP_REQUIRED,
    href: "/billing",
  });
}

export function nextPeriodEnd(currentEnd: string | null | undefined, periodDays: number) {
  const now = Date.now();
  const existing = currentEnd ? new Date(currentEnd).getTime() : 0;
  const base = existing > now ? existing : now;
  return new Date(base + periodDays * 24 * 60 * 60 * 1000).toISOString();
}

export async function grantMembership(input: {
  userId: string;
  orderId: string;
  paymentId: string;
  method?: string | null;
  raw: Record<string, unknown>;
}) {
  const admin = createServiceSupabase();
  const db = admin;
  if (!db) {
    throw new ApiError("Add SUPABASE_SERVICE_ROLE_KEY so the webhook can grant membership.", 503);
  }

  const { data: payment, error: payErr } = await db
    .from("payments")
    .select("id, user_id, status, billing_plan_id, razorpay_payment_id")
    .eq("razorpay_order_id", input.orderId)
    .maybeSingle();
  throwIfBillingSchemaMissing(payErr);
  if (payErr) throw new ApiError(payErr.message, 500);
  if (!payment) throw new ApiError("Unknown payment.", 404);
  if (input.userId && payment.user_id !== input.userId) {
    throw new ApiError("Unknown payment.", 404);
  }
  const userId = payment.user_id;

  const attachMembership = async () => {
    const { data: plan } = await db
      .from("billing_plans")
      .select("period_days")
      .eq("id", payment.billing_plan_id)
      .maybeSingle();
    const periodDays = plan?.period_days || COACH_PERIOD_DAYS;
    const { data: existing } = await db
      .from("memberships")
      .select("current_period_end, last_payment_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing && existing.last_payment_id === payment.id) {
      return existing.current_period_end as string;
    }
    const periodEnd = nextPeriodEnd(existing?.current_period_end, periodDays);
    const { error: memErr } = await db.from("memberships").upsert({
      user_id: userId,
      status: "active",
      current_period_end: periodEnd,
      last_payment_id: payment.id,
    });
    if (memErr) throw new ApiError(memErr.message, 500);
    return periodEnd;
  };

  if (payment.status === "paid") {
    const { data: existing } = await db
      .from("memberships")
      .select("current_period_end, last_payment_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (existing?.last_payment_id && existing.last_payment_id !== payment.id) {
      return {
        alreadyPaid: true as const,
        paymentId: payment.id,
        periodEnd: existing.current_period_end as string,
      };
    }
    const periodEnd = await attachMembership();
    return { alreadyPaid: true as const, paymentId: payment.id, periodEnd };
  }

  const method = input.method === "upi" || input.method === "card" ? input.method : null;
  const { data: updated, error: updatePay } = await db
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: input.paymentId,
      method,
      raw: input.raw,
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.id)
    .eq("status", "created")
    .select("id")
    .maybeSingle();
  if (updatePay) {
    if (/duplicate|unique/i.test(updatePay.message)) {
      const periodEnd = await attachMembership();
      return { alreadyPaid: true as const, paymentId: payment.id, periodEnd };
    }
    throw new ApiError(updatePay.message, 500);
  }
  if (!updated) {
    const periodEnd = await attachMembership();
    return { alreadyPaid: true as const, paymentId: payment.id, periodEnd };
  }

  const periodEnd = await attachMembership();
  return { alreadyPaid: false as const, paymentId: payment.id, periodEnd };
}
