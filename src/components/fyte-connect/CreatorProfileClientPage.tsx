"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCreator } from "@frontend/features/fyte-connect";
import type { Creator, CreatorPlan } from "@/shared/types";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";

export default function CreatorProfileClientPage() {
  const params = useParams();
  const creatorId = params?.id as string;
  const [creator, setCreator] = useState<Creator | null>(null);
  const [plans, setPlans] = useState<CreatorPlan[]>([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!creatorId) return;
    getCreator(creatorId).then(({ creator: creatorData, plans: planData }) => {
      if (!creatorData) setMissing(true);
      else {
        setCreator(creatorData);
        setPlans(planData || []);
      }
    });
  }, [creatorId]);

  if (missing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-gray-600">Creator not found.</p>
          <Link href="/fyte-connect" className="mt-4 inline-block font-semibold text-[#282828]">
            Back to Fyte Connect
          </Link>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-gray-600">Loading...</p>
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
            { label: creator.full_name },
          ]}
        />

        <header className="mb-8 border-b border-gray-200 pb-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#282828] text-lg font-semibold text-white">
              {creator.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                creator.full_name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{creator.full_name}</h1>
              <p className="mt-1 text-sm text-gray-500">{creator.category || "Fitness creator"}</p>
            </div>
          </div>
          {creator.bio ? <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-700">{creator.bio}</p> : null}
          <div className="mt-4">
            <InstagramLink handle={creator.instagram_handle} />
          </div>
        </header>

        <h2 className="mb-4 text-lg font-semibold text-[#282828]">Plans</h2>
        {plans.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="flex flex-col rounded-2xl border border-gray-200 bg-white p-6">
                <h3 className="text-lg font-semibold text-[#282828]">{plan.title}</h3>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">{plan.description}</p>
                <p className="mt-3 text-sm text-gray-500">
                  {plan.duration_weeks ? `${plan.duration_weeks} weeks` : "Open length"}
                  {plan.difficulty ? ` · ${plan.difficulty}` : ""}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <p className="font-semibold text-[#282828]">Rs {plan.price}</p>
                  <Link
                    href={`/fyte-connect/checkout/${plan.id}`}
                    className="rounded-xl bg-[#282828] px-4 py-2 text-sm font-semibold text-white hover:bg-[#454545]"
                  >
                    View and buy
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-gray-200 bg-white px-5 py-8 text-sm text-gray-600">
            No plans yet.
          </p>
        )}

        <RatingReview targetType="creator" targetId={creator.id} />
      </div>
    </div>
  );
}
