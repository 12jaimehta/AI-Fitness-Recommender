"use client";

import { useEffect, useState } from "react";
import { createRating, listRatings } from "@frontend/features/fyte-connect";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import Link from "next/link";
import { ReviewsSkeleton } from "@/components/ui/Skeleton";

type TargetType = "trainer" | "creator" | "plan";

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user_profiles?: { full_name: string | null } | null;
}

export default function RatingReview({
  targetType,
  targetId,
}: {
  targetType: TargetType;
  targetId: string;
}) {
  const { isSignedIn } = useCurrentUser();
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const loadRatings = async () => {
    try {
      const data = (await listRatings(targetType, targetId)) as RatingRow[];
      setRatings(data || []);
      if (data?.length) {
        const avg = data.reduce((sum, item) => sum + item.rating, 0) / data.length;
        setAvgRating(parseFloat(avg.toFixed(1)));
      } else {
        setAvgRating(null);
      }
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    setReady(false);
    void loadRatings();
  }, [targetId, targetType]);

  const handleSubmit = async () => {
    if (!isSignedIn || rating === 0) return;
    setLoading(true);
    try {
      await createRating({
        targetType,
        targetId,
        rating,
        review: review.trim() || null,
      });
      setRating(0);
      setReview("");
      await loadRatings();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
      {!ready ? (
        <ReviewsSkeleton />
      ) : (
        <>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#282828]">Reviews</h2>
              <p className="text-sm text-gray-500">
                {ratings.length} review{ratings.length === 1 ? "" : "s"}
              </p>
            </div>
            <p className="text-xl font-semibold text-[#282828]">{avgRating ?? "-"}</p>
          </div>

          {isSignedIn ? (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-[#282828]">Your rating</p>
              <div className="mb-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold ${
                      value <= rating ? "bg-[#282828] text-white" : "border border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#282828]"
                rows={3}
                placeholder="Write a short review (optional)"
                value={review}
                onChange={(event) => setReview(event.target.value)}
              />
              <button
                type="button"
                disabled={loading || rating === 0}
                onClick={handleSubmit}
                className="mt-3 rounded-xl bg-[#282828] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Saving..." : "Submit review"}
              </button>
            </div>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              <Link href="/sign-in" className="font-semibold text-[#282828]">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}

          <div className="space-y-3">
            {ratings.map((item) => (
              <article key={item.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#282828]">
                    {item.user_profiles?.full_name || "Member"}
                  </p>
                  <p className="text-sm text-gray-500">{item.rating} / 5</p>
                </div>
                {item.review ? <p className="mt-2 text-sm text-gray-600">{item.review}</p> : null}
              </article>
            ))}
            {ratings.length === 0 ? <p className="text-sm text-gray-500">No reviews yet.</p> : null}
          </div>
        </>
      )}
    </section>
  );
}
