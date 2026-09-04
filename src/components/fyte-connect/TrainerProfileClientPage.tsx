"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBooking, getTrainer } from "@frontend/features/fyte-connect";
import type { Trainer } from "@/shared/types";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageHero from "@/components/shared/PageHero";
import FormInput from "@/components/shared/FormInput";
import FormTextarea from "@/components/shared/FormTextarea";
import { TrainerProfileSkeleton } from "@/components/ui/Skeleton";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";
import { fyte } from "@/shared/lib/ui";
import { cn } from "@/lib/utils";

export default function TrainerProfileClientPage() {
  const params = useParams();
  const trainerId = params?.id as string;
  const { isSignedIn } = useCurrentUser();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [missing, setMissing] = useState(false);
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    if (!trainerId) return;
    getTrainer(trainerId).then((data) => {
      if (!data) setMissing(true);
      else setTrainer(data);
    });
  }, [trainerId]);

  const handleBook = async () => {
    if (!isSignedIn || !trainer || !sessionDate) return;
    setBookingLoading(true);
    setBookingMessage("");
    try {
      await createBooking({ trainerId: trainer.id, sessionDate, notes: notes.trim() || null });
      setNotes("");
      setSessionDate("");
      setBookingMessage("Session requested. The trainer will confirm.");
    } catch {
      setBookingMessage("Could not book. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (missing) {
    return (
      <div className={fyte.page}>
        <PageHero
          photo="connect"
          kicker="Trainers"
          title="Trainer not found"
          subtitle="They may have removed their profile."
          actions={
            <Link href="/fyte-connect" className={fyte.glassSolid}>
              Back to trainers
            </Link>
          }
        />
      </div>
    );
  }

  if (!trainer) return <TrainerProfileSkeleton />;

  const name = trainer.full_name || "Trainer";

  return (
    <div className={fyte.page}>
      <PageHero
        photo="connect"
        kicker={trainer.is_verified ? "Verified trainer" : "Trainer"}
        title={name}
        subtitle={trainer.experience_years ? `${trainer.experience_years} years of coaching` : "Fitness trainer"}
        actions={<InstagramLink handle={trainer.instagram_handle} />}
        aside={
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white/30 bg-fyte-ink text-3xl font-extrabold text-white shadow-2xl">
            {trainer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trainer.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
        }
      />

      <div className={cn(fyte.content, "grid gap-6 lg:grid-cols-[1.4fr_1fr]")}>
        <div className="space-y-6">
          <section className={fyte.card}>
            <p className={fyte.kicker}>About</p>
            <p className="mt-2 text-base leading-7 text-fyte-ink">{trainer.bio || "This trainer hasn't written a bio yet."}</p>
            {trainer.expertise?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {trainer.expertise.map((item) => (
                  <span key={item} className="rounded-full bg-fyte-panel px-3 py-1 text-sm font-medium text-fyte-ink">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </section>
          <RatingReview targetType="trainer" targetId={trainer.id} />
        </div>

        <aside className={cn(fyte.card, "h-fit lg:sticky lg:top-28")}>
          <div className="flex items-baseline justify-between">
            <h2 className={fyte.title}>Book a session</h2>
            <p className="text-lg font-extrabold text-fyte-ink">{trainer.hourly_rate ? `₹${trainer.hourly_rate}/hr` : "Ask"}</p>
          </div>
          <div className="mt-5 space-y-5">
            <FormInput label="Date and time" type="datetime-local" value={sessionDate} onChange={setSessionDate} required />
            <FormTextarea label="What do you want to work on?" value={notes} onChange={setNotes} rows={3} placeholder="Goal, injuries, schedule" />
          </div>
          {isSignedIn ? (
            <button type="button" disabled={bookingLoading || !sessionDate} onClick={handleBook} className={`${fyte.primary} mt-5 w-full sm:w-full`}>
              {bookingLoading ? "Booking…" : "Request session"}
            </button>
          ) : (
            <Link href="/sign-in" className={`${fyte.primary} mt-5 w-full sm:w-full`}>
              Sign in to book
            </Link>
          )}
          {bookingMessage ? <p className="mt-3 text-sm text-fyte-muted">{bookingMessage}</p> : null}
        </aside>
      </div>
    </div>
  );
}
