"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Shield } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { FadeInView } from "@/components/shared/Motion";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";
import type { MembershipView } from "@/shared/types/billing";
import {
  createMembershipOrder,
  getMembership,
  verifyMembershipPayment,
} from "@/lib/service/billing";

type RazorpayCheckout = {
  open: () => void;
  on: (event: string, handler: (response: { error?: { description?: string; reason?: string } }) => void) => void;
};

type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayCheckout;

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

const INCLUDED = [
  "Photo or a sentence when you ate something else",
  "Two or three trainer questions — butter, drink, portion",
  "Swap one meal or session inside the same calorie / time budget",
  "Extra walk today, or a lighter meal tomorrow. Delay in days, not a lecture",
];

const FREE = [
  "First diet and first workout — once each",
  "Ate it / trained / skipped / weight / sleep",
];

function periodLabel(iso: string | null | undefined) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BillingClientPage({ initial = null }: { initial?: MembershipView | null }) {
  const router = useRouter();
  const [membership, setMembership] = useState<MembershipView | null>(initial);
  const [scriptReady, setScriptReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) setScriptReady(true);
  }, []);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    getMembership()
      .then((data) => {
        if (!cancelled) setMembership(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load billing.");
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const plan = membership?.plan;
  const active = Boolean(membership?.active);
  const canPay = Boolean(membership?.checkoutReady && scriptReady && !active && !membership?.setupRequired);

  const pay = async () => {
    if (!window.Razorpay) {
      setError("Checkout is still loading. Try again in a second.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const order = await createMembershipOrder();
      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#282828" },
        method: { upi: true, card: true, netbanking: false, wallet: false, emi: false, paylater: false },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const next = await verifyMembershipPayment(response);
            setMembership(next);
            router.push("/progress");
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Paid, but we could not unlock the coach. Refresh — the webhook may still land.");
            setBusy(false);
          }
        },
      });
      checkout.on("payment.failed", (response) => {
        setBusy(false);
        setError(response.error?.description || "Payment failed. Try UPI or another card.");
      });
      checkout.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setBusy(false);
    }
  };

  return (
    <div className={fyte.page}>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptReady(true)}
        onError={() => setError("Could not load Razorpay checkout. Check your connection and try again.")}
      />
      <PageHero
        photo="coach"
        kicker="Membership"
        title={active ? "Coach is on." : "We watch the week. You pay for the noticing."}
        subtitle={
          active
            ? `Active until ${periodLabel(membership?.currentPeriodEnd)}. Same coach, same slots.`
            : "Thirty days of a trainer who patches the meal or session that slipped."
        }
        actions={
          active ? (
            <Link href="/progress" className={fyte.glassSolid}>
              Open coach
            </Link>
          ) : (
            <button type="button" disabled={!canPay || busy} onClick={() => void pay()} className={fyte.glassSolid}>
              {busy ? "Opening checkout…" : `Pay ${plan?.amountLabel || "₹299"} with UPI or card`}
            </button>
          )
        }
        aside={
          <div className={cn(fyte.stat, "min-w-44 text-center")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">30 days</p>
            <p className="mt-1 text-4xl font-extrabold">{plan?.amountLabel || "₹299"}</p>
            <p className="mt-1 text-xs text-white/70">UPI or card. Then you&apos;re in.</p>
          </div>
        }
      />

      <div className={fyte.content}>
        {error ? <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-fyte-danger">{error}</p> : null}

        {membership?.setupRequired ? (
          <section className={`${fyte.card} mb-6`}>
            <p className={fyte.title}>One SQL file to turn payments on</p>
            <p className={`mt-2 ${fyte.body}`}>{membership.setupMessage}</p>
          </section>
        ) : null}

        {!membership?.checkoutReady && !membership?.setupRequired ? (
          <section className={`${fyte.card} mb-6`}>
            <p className={fyte.title}>Payments are not fully configured</p>
            <p className={`mt-2 ${fyte.body}`}>
              Add <code className="font-semibold">RAZORPAY_KEY_ID</code> (or{" "}
              <code className="font-semibold">NEXT_PUBLIC_RAZORPAY_KEY_ID</code>),{" "}
              <code className="font-semibold">RAZORPAY_KEY_SECRET</code>, and{" "}
              <code className="font-semibold">SUPABASE_SERVICE_ROLE_KEY</code> — see documentation/keys.md. Until then the coach
              stays unlocked.
            </p>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className={fyte.card}>
            <p className={fyte.kicker}>What you pay for</p>
            <h2 className="mt-2 text-2xl font-bold text-fyte-ink">The trainer in the app</h2>
            <ul className="mt-5 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-fyte-ink">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fyte-ink text-white">
                    <Check size={12} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className={`mt-6 ${fyte.body}`}>
              Free forever: {FREE.join(". ")}.
            </p>
          </section>

          <aside className={cn(fyte.card, "h-fit")}>
            <p className={fyte.kicker}>This pass</p>
            <p className="mt-2 text-3xl font-extrabold text-fyte-ink">{plan?.amountLabel || "₹299"}</p>
            <p className={fyte.body}>{plan?.periodDays || 30} days. Pay again when it lapses. Autopay comes later.</p>
            <ul className="mt-5 space-y-2 text-sm text-fyte-muted">
              <li className="flex items-center gap-2">
                <Shield size={16} className="text-fyte-ink" /> Razorpay. UPI and cards only.
              </li>
              <li>No netbanking, wallets, EMI, or PayPal.</li>
              <li>First purchase: 7-day refund if you email us. No prorated refund after that.</li>
            </ul>
            {!active ? (
              <button
                type="button"
                disabled={!canPay || busy}
                onClick={() => void pay()}
                className={`${fyte.primary} mt-6 w-full sm:w-full`}
              >
                {busy ? "Opening checkout…" : "Pay with UPI or card"}
              </button>
            ) : (
              <Link href="/progress" className={`${fyte.primary} mt-6 w-full sm:w-full`}>
                Back to coach
              </Link>
            )}
          </aside>
        </div>

        <FadeInView className="mt-10 rounded-2xl bg-fyte-ink p-6 text-white shadow-card sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">How it works</p>
          <h2 className="mt-2 text-2xl font-bold">One payment. Thirty days of noticing.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
            A trainer is a month of attention, not a meter. Pay with UPI or card. When the pass lapses, buy another.
            Autopay comes later.
          </p>
        </FadeInView>
      </div>
    </div>
  );
}
