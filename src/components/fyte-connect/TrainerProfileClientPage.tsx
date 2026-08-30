"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createBooking, getTrainer } from "@frontend/features/fyte-connect";
import type { Trainer } from "@/shared/types";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import PageBreadcrumb from "@/components/shared/PageBreadcrumb";
import InstagramLink from "@/components/fyte-connect/InstagramLink";
import RatingReview from "@/components/fyte-connect/RatingReview";

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
      await createBooking({
        trainerId: trainer.id,
        sessionDate,
        notes: notes.trim() || null,
      });
      setNotes("");
      setSessionDate("");
      setBookingMessage("Session requested.");
    } catch {
      setBookingMessage("Could not book. Try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (missing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-gray-600">Trainer not found.</p>
          <Link href="/fyte-connect" className="mt-4 inline-block font-semibold text-[#282828]">
            Back to Trainers
          </Link>
        </div>
      </div>
    );
  }

  if (!trainer) {
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
            { label: "Trainers", href: "/fyte-connect" },
            { label: trainer.full_name || "Trainer" },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <div className="mb-5 flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#282828] text-lg font-semibold text-white">
                {trainer.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={trainer.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (trainer.full_name || "T").charAt(0)
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {trainer.full_name || "Trainer"}
                </h1>
                <p className="mt-1 text-gray-600">
                  {trainer.experience_years
                    ? `${trainer.experience_years} years of experience`
                    : "Fitness trainer"}
                </p>
              </div>
            </div>

            {trainer.bio ? <p className="mt-4 text-sm leading-6 text-gray-700">{trainer.bio}</p> : null}

            {trainer.expertise?.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {trainer.expertise.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-2">
              <InstagramLink handle={trainer.instagram_handle} />
            </div>

            <RatingReview targetType="trainer" targetId={trainer.id} />
          </div>

          <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-[#282828]">Book a session</h2>
            <p className="mt-1 text-sm text-gray-600">
              Pick a date and time. You can also message on Instagram.
            </p>

            <label className="mt-4 block text-sm font-medium text-[#282828]">Date and time</label>
            <input
              type="datetime-local"
              value={sessionDate}
              onChange={(event) => setSessionDate(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#282828]"
            />

            <label className="mt-4 block text-sm font-medium text-[#282828]">Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#282828]"
              placeholder="What do you want to work on?"
            />

            <p className="mt-4 text-sm text-gray-600">
              Rate: {trainer.hourly_rate ? `Rs ${trainer.hourly_rate} / hour` : "Ask the trainer"}
            </p>

            {isSignedIn ? (
              <button
                type="button"
                disabled={bookingLoading || !sessionDate}
                onClick={handleBook}
                className="mt-4 w-full rounded-xl bg-[#282828] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {bookingLoading ? "Booking..." : "Book session"}
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="mt-4 block w-full rounded-xl bg-[#282828] px-5 py-3 text-center text-sm font-semibold text-white"
              >
                Sign in to book
              </Link>
            )}
            {bookingMessage ? <p className="mt-3 text-sm text-gray-600">{bookingMessage}</p> : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
