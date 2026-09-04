"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { getMarketplace } from "@frontend/features/fyte-connect";
import type { Trainer } from "@/shared/types";
import PageHero from "@/components/shared/PageHero";
import { FadeInView } from "@/components/shared/Motion";
import { TrainersSkeleton } from "@/components/ui/Skeleton";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

export default function FyteConnectClientPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMarketplace()
      .then((data) => setTrainers(data.trainers || []))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase().replace(/^@/, "");
  const filteredTrainers = useMemo(() => {
    if (!q) return trainers;
    return trainers.filter((trainer) => {
      const handle = (trainer.instagram_handle || "").toLowerCase();
      return (
        trainer.full_name?.toLowerCase().includes(q) ||
        trainer.bio?.toLowerCase().includes(q) ||
        handle.includes(q) ||
        trainer.expertise?.some((item) => item.toLowerCase().includes(q))
      );
    });
  }, [trainers, q]);

  if (loading) return <TrainersSkeleton />;

  return (
    <div className={fyte.page}>
      <PageHero
        photo="connect"
        kicker="Trainers"
        title="A human, when you want one."
        subtitle="Browse trainers, book a session, or list yourself so people can hire you."
        actions={
          <Link href="/fyte-connect/become-trainer" className={fyte.glass}>
            <UserPlus size={16} /> Become a trainer
          </Link>
        }
        aside={
          <label className="flex h-12 w-full items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 text-white backdrop-blur-md lg:w-80">
            <Search size={18} className="shrink-0 text-white/70" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name, skill, or Instagram"
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/60"
            />
          </label>
        }
      />

      <div className={fyte.content}>
        {filteredTrainers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrainers.map((trainer, index) => (
              <FadeInView key={trainer.id} delay={index * 0.03}>
                <article className={cn(fyte.card, fyte.cardHover, "flex h-full flex-col")}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-fyte-ink text-base font-bold text-white">
                      {trainer.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={trainer.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (trainer.full_name || "T").charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-fyte-ink">{trainer.full_name || "Trainer"}</h3>
                      <p className="text-xs font-semibold uppercase tracking-wide text-fyte-muted">
                        {trainer.is_verified ? "Verified · " : ""}
                        {trainer.hourly_rate ? `₹${trainer.hourly_rate} / hr` : "Rate on request"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-fyte-muted">{trainer.bio || "Personal trainer."}</p>
                  {trainer.expertise?.length ? (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {trainer.expertise.slice(0, 3).map((item) => (
                        <span key={item} className="rounded-full bg-fyte-panel px-2.5 py-1 text-xs font-medium text-fyte-ink">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/fyte-connect/trainers/${trainer.id}`} className={cn(fyte.primary, "h-10 w-auto px-4")}>
                      Hire
                    </Link>
                    <InstagramLink handle={trainer.instagram_handle} compact />
                  </div>
                </article>
              </FadeInView>
            ))}
          </div>
        ) : (
          <div className={cn(fyte.card, "py-14 text-center")}>
            <p className="text-lg font-bold text-fyte-ink">{q ? "No trainers match that." : "No trainers yet."}</p>
            <p className={`mt-1 ${fyte.body}`}>{q ? "Try a different word." : "Be the first one people can book."}</p>
            {!q ? (
              <Link href="/fyte-connect/become-trainer" className={`${fyte.primary} mt-6`}>
                Become a trainer
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
