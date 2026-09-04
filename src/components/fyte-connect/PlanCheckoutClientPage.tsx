"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlan, purchasePlan } from "@frontend/features/fyte-connect";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageHero from "@/components/shared/PageHero";
import { CheckoutSkeleton } from "@/components/ui/Skeleton";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";
import type { CreatorPlan } from "@/shared/types";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

type PlanWithCreator = CreatorPlan & {
  creators: { id: string; full_name: string; instagram_handle?: string | null } | null;
};

export default function PlanCheckoutClientPage() {
  const params = useParams();
  const planId = params?.planId as string;
  const { isSignedIn } = useCurrentUser();
  const [plan, setPlan] = useState<PlanWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  useEffect(() => {
    if (!planId) return;
    getPlan(planId).then(({ plan: data, alreadyOwned: owned }) => {
      setPlan(data as PlanWithCreator | null);
      setAlreadyOwned(owned);
      setLoading(false);
    });
  }, [planId, isSignedIn]);

  const handlePurchase = async () => {
    if (!isSignedIn || !plan) return;
    setPurchasing(true);
    try {
      await purchasePlan(plan.id);
      setAlreadyOwned(true);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <CheckoutSkeleton />;

  if (!plan) {
    return (
      <div className={fyte.page}>
        <PageHero
          photo="connect"
          kicker="Plans"
          title="Plan not found"
          actions={
            <Link href="/fyte-connect" className={fyte.glassSolid}>
              Back to Fyte Connect
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={fyte.page}>
      <PageHero
        photo="connect"
        kicker={plan.creators ? `By ${plan.creators.full_name}` : "Plan"}
        title={plan.title}
        subtitle={[plan.duration_weeks ? `${plan.duration_weeks} weeks` : "Open length", plan.difficulty].filter(Boolean).join(" · ")}
        actions={plan.creators?.instagram_handle ? <InstagramLink handle={plan.creators.instagram_handle} /> : undefined}
        aside={
          <div className={cn(fyte.stat, "min-w-[10rem] text-center")}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Price</p>
            <p className="mt-1 text-3xl font-extrabold">₹{plan.price}</p>
          </div>
        }
      />

      <div className={cn(fyte.content, "grid gap-6 lg:grid-cols-[1.4fr_1fr]")}>
        <div className="space-y-6">
          {plan.description ? (
            <section className={fyte.card}>
              <p className={fyte.kicker}>What&apos;s inside</p>
              <p className="mt-2 text-base leading-7 text-fyte-ink">{plan.description}</p>
            </section>
          ) : null}
          <RatingReview targetType="plan" targetId={plan.id} />
        </div>

        <aside className={cn(fyte.card, "h-fit lg:sticky lg:top-28")}>
          <h2 className={fyte.title}>Get this plan</h2>
          <p className="mt-2 text-3xl font-extrabold text-fyte-ink">₹{plan.price}</p>
          <p className={`mt-1 ${fyte.body}`}>One-time. Yours to keep.</p>
          {alreadyOwned ? (
            <p className="mt-5 rounded-xl bg-fyte-ink px-4 py-3 text-sm font-medium text-white">You already own this plan.</p>
          ) : isSignedIn ? (
            <button type="button" disabled={purchasing} onClick={handlePurchase} className={`${fyte.primary} mt-5 w-full sm:w-full`}>
              {purchasing ? "Processing…" : "Buy plan"}
            </button>
          ) : (
            <Link href="/sign-in" className={`${fyte.primary} mt-5 w-full sm:w-full`}>
              Sign in to buy
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
