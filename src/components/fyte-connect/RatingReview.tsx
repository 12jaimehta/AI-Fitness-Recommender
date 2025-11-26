"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/supabase-client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

type TargetType = "trainer" | "creator" | "plan";

interface RatingReviewProps {
  targetType: TargetType;
  targetId: string;
}

interface RatingRow {
  id: string;
  user_id: string;
  rating: number;
  review: string | null;
  created_at: string;
  user_profiles?: {
    full_name: string | null;
  } | null;
}

export default function RatingReview({ targetType, targetId }: RatingReviewProps) {
  const supabase = createClient();
  const { user, isSignedIn } = useCurrentUser();

  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const loadRatings = async () => {
    const { data, error } = await supabase
      .from("ratings")
      .select(
        `
        id,
        user_id,
        rating,
        review,
        created_at,
        user_profiles ( full_name )
      `
      )
      .eq("target_type", targetType)
      .eq("target_id", targetId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRatings(data as any);
      if (data.length) {
        const avg =
          data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
        setAvgRating(parseFloat(avg.toFixed(1)));
      } else {
        setAvgRating(null);
      }
    }
  };

  useEffect(() => {
    loadRatings();
  }, [targetId, targetType]);

  const handleSubmit = async () => {
    if (!isSignedIn || !user) return;
    if (rating === 0) return;

    setLoading(true);
    const { error } = await supabase.from("ratings").insert({
      user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      rating,
      review: review.trim() || null,
    });

    setLoading(false);
    if (!error) {
      setRating(0);
      setReview("");
      await loadRatings();
    }
  };

  return (
    <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">
            Ratings & Reviews
          </p>
          <h3 className="text-xl font-bold mt-1">What people say</h3>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold flex items-center justify-end gap-1">
            {avgRating ?? "—"}
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          </p>
          <p className="text-xs text-white/60">
            {ratings.length} review{ratings.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Add Review */}
      {isSignedIn ? (
        <div className="mb-6 border border-white/10 rounded-xl p-4 bg-white/5">
          <p className="text-sm font-semibold mb-2">Rate this</p>
          <div className="flex items-center gap-2 mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-7 h-7 transition-all ${
                    s <= rating
                      ? "fill-yellow-400 text-yellow-400 scale-110"
                      : "text-white/30 hover:text-yellow-300"
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-[#0f1c2f] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#162a41]/60"
            rows={3}
            placeholder="Share your experience (optional)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />

          <div className="mt-3 flex justify-end">
            <motion.button
              whileTap={{ scale: 0.96 }}
              disabled={loading || rating === 0}
              onClick={handleSubmit}
              className={`px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 
                ${
                  rating === 0 || loading
                    ? "bg-white/10 text-white/40 cursor-not-allowed"
                    : "bg-[#162a41] hover:bg-[#1d3b61] text-white"
                }`}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </motion.button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-white/60 mb-4">
          Sign in to rate and review.
        </p>
      )}

      {/* List Reviews */}
      <div className="space-y-4 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
        {ratings.map((r) => (
          <div
            key={r.id}
            className="border border-white/10 rounded-xl p-3 bg-black/20"
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold">
                {r.user_profiles?.full_name || "Anonymous"}
              </p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= r.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-white/30"
                    }`}
                  />
                ))}
              </div>
            </div>
            {r.review && (
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                {r.review}
              </p>
            )}
            <p className="text-[10px] text-white/40 mt-1">
              {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}

        {ratings.length === 0 && (
          <p className="text-xs text-white/50 italic">
            No reviews yet. Be the first one!
          </p>
        )}
      </div>
    </div>
  );
}
