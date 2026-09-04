"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCreator } from "@frontend/features/fyte-connect";
import type { Creator, CreatorPlan } from "@/shared/types";
import PageHero from "@/components/shared/PageHero";
import { FadeInView } from "@/components/shared/Motion";
import { TrainerProfileSkeleton } from "@/components/ui/Skeleton";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

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
      <div className={fyte.page}>
        <PageHero
          photo="connect"
          kicker="Creators"
          title="Creator not found"
          actions={
            <Link href="/fyte-connect" className={fyte.glassSolid}>
              Back to Fyte Connect
            </Link>
          }
        />
      </div>
    );
  }

  if (!creator) return <TrainerProfileSkeleton />;

  return (
    <div className={fyte.page}>
      <PageHero
        photo="connect"
        kicker={creator.category || "Fitness creator"}
        title={creator.full_name}
        subtitle={creator.bio || undefined}
        actions={<InstagramLink handle={creator.instagram_handle} />}
        aside={
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-fyte-ink text-3xl font-extrabold text-white shadow-2xl">
            {creator.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={creator.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              creator.full_name.charAt(0)
            )}
          </div>
        }
      />

      <div className={fyte.content}>
        <h2 className="mb-4 text-xl font-bold text-fyte-ink">Plans</h2>
        {plans.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <FadeInView key={plan.id} delay={index * 0.03}>
                <article className={cn(fyte.card, fyte.cardHover, "flex h-full flex-col")}>
                  <p className={fyte.kicker}>
                    {plan.duration_weeks ? `${plan.duration_weeks} weeks` : "Open length"}
                    {plan.difficulty ? ` · ${plan.difficulty}` : ""}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-fyte-ink">{plan.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-fyte-muted">{plan.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xl font-extrabold text-fyte-ink">₹{plan.price}</p>
                    <Link href={`/fyte-connect/checkout/${plan.id}`} className={cn(fyte.primary, "h-10 w-auto px-4")}>
                      View
                    </Link>
                  </div>
                </article>
              </FadeInView>
            ))}
          </div>
        ) : (
          <p className={cn(fyte.card, "py-10 text-center text-sm text-fyte-muted")}>No plans yet.</p>
        )}

        <div className="mt-8">
          <RatingReview targetType="creator" targetId={creator.id} />
        </div>
      </div>
    </div>
  );
}
