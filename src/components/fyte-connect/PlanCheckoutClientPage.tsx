"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlan, purchasePlan } from "@frontend/features/fyte-connect";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import PageLoader from "@/components/ui/PageLoader";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";
import type { CreatorPlan } from "@/shared/types";

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

  if (loading) {
    return <PageLoader />;
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-gray-600">Plan not found.</p>
          <Link href="/fyte-connect" className="mt-4 inline-block font-semibold text-[#282828]">
            Back to Fyte Connect
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <PageBreadcrumb
          items={[
            { label: "Home" },
            { label: "Fyte Connect", href: "/fyte-connect" },
            { label: plan.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{plan.title}</h1>
            {plan.creators ? (
              <p className="mt-2 text-sm text-gray-600">By {plan.creators.full_name}</p>
            ) : null}
            <p className="mt-2 text-sm text-gray-500">
              {plan.duration_weeks ? `${plan.duration_weeks} weeks` : "Open length"}
              {plan.difficulty ? ` · ${plan.difficulty}` : ""}
            </p>
            {plan.description ? (
              <p className="mt-4 text-sm leading-6 text-gray-700">{plan.description}</p>
            ) : null}
            {plan.creators?.instagram_handle ? (
              <div className="mt-4">
                <InstagramLink handle={plan.creators.instagram_handle} />
              </div>
            ) : null}
            <RatingReview targetType="plan" targetId={plan.id} />
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#282828]">Buy this plan</h2>
            <p className="mt-2 text-2xl font-bold text-[#282828]">Rs {plan.price}</p>
            {alreadyOwned ? (
              <p className="mt-4 text-sm text-gray-600">You already own this plan.</p>
            ) : isSignedIn ? (
              <button
                type="button"
                disabled={purchasing}
                onClick={handlePurchase}
                className="mt-4 w-full rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {purchasing ? "Processing..." : "Buy plan"}
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="mt-4 block w-full rounded-xl bg-[#282828] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Sign in to buy
              </Link>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
