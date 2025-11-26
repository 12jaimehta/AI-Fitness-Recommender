"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { useCurrentUser } from "@/lib/hooks/use-current-user";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import RatingReview from "@/components/fyte-connect/RatingReview";

interface PlanWithCreator {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_weeks: number | null;
  difficulty: string | null;
  cover_image: string | null;
  creator_id: string;
  creators: {
    id: string;
    full_name: string;
  } | null;
}

export default function PlanCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { user, isSignedIn } = useCurrentUser();

  const planId = params?.planId as string;

  const [plan, setPlan] = useState<PlanWithCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [alreadyOwned, setAlreadyOwned] = useState(false);

  useEffect(() => {
    if (!planId) return;

    const loadPlan = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("creator_plans")
        .select(
          `
          id,
          title,
          description,
          price,
          duration_weeks,
          difficulty,
          cover_image,
          creator_id,
          creators (
            id,
            full_name
          )
        `
        )
        .eq("id", planId)
        .single();

      setPlan(data as any);
      setLoading(false);

      if (isSignedIn && user && data) {
        const { data: existingPurchase } = await supabase
          .from("plan_purchases")
          .select("id")
          .eq("user_id", user.id)
          .eq("plan_id", planId)
          .maybeSingle();

        if (existingPurchase) setAlreadyOwned(true);
      }
    };

    loadPlan();
  }, [planId, isSignedIn, user]);

  const handlePurchase = async () => {
    if (!isSignedIn || !user || !plan) return;

    setPurchasing(true);
    await supabase.from("plan_purchases").insert({
      user_id: user.id,
      plan_id: plan.id,
    });
    setPurchasing(false);
    setAlreadyOwned(true);
  };

  if (loading || !plan) {
    return (
      <div className="min-h-screen bg-[#0f1c2f] text-white flex items-center justify-center">
        Loading plan...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1c2f] text-white pb-20">
      <div className="max-w-[1100px] mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="grid md:grid-cols-[2fr,1.3fr] gap-10">
          {/* Left - Plan Details */}
          <div>
            {plan.cover_image && (
              <div className="w-full h-60 rounded-2xl overflow-hidden mb-5 border border-white/10">
                <img
                  src={plan.cover_image}
                  alt={plan.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="text-xs uppercase tracking-wide text-white/60">
              FyteConnect Plan
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold mt-1 mb-2">
              {plan.title}
            </h1>

            {plan.creators && (
              <p className="text-sm text-white/70 mb-2">
                by <span className="font-semibold">{plan.creators.full_name}</span>
              </p>
            )}

            {plan.duration_weeks && (
              <p className="text-xs text-white/60 mb-1">
                Duration: {plan.duration_weeks} weeks
              </p>
            )}

            {plan.difficulty && (
              <p className="text-xs text-white/60 mb-4">
                Level: {plan.difficulty}
              </p>
            )}

            <p className="text-sm text-white/80 leading-relaxed mb-8">
              {plan.description}
            </p>

            <RatingReview targetType="plan" targetId={plan.id} />
          </div>

          {/* Right - Purchase Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold">One-time Purchase</p>
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>

            <div className="mb-6">
              <p className="text-3xl font-extrabold mb-1">₹{plan.price}</p>
              <p className="text-xs text-white/60">
                Lifetime access to this structured {plan.duration_weeks || ""}{" "}
                week plan.
              </p>
            </div>

            {alreadyOwned ? (
              <div className="border border-emerald-400/30 bg-emerald-500/10 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-200">
                    You already own this plan
                  </p>
                  <p className="text-xs text-emerald-100/80 mt-1">
                    You can revisit and follow it anytime from your “My Plans”
                    section (you can build that later).
                  </p>
                </div>
              </div>
            ) : isSignedIn ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                disabled={purchasing}
                onClick={handlePurchase}
                className={`w-full rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2
                  ${
                    purchasing
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-[#162a41] hover:bg-[#1d3b61]"
                  }`}
              >
                {purchasing ? "Processing..." : "Buy Plan Securely"}
                <CheckCircle2 className="w-4 h-4" />
              </motion.button>
            ) : (
              <button
                onClick={() => router.push("/sign-in")}
                className="w-full rounded-xl py-3 text-sm font-semibold bg-[#162a41] hover:bg-[#1d3b61]"
              >
                Login to purchase
              </button>
            )}

            <ul className="mt-6 space-y-2 text-xs text-white/70">
              <li>• Instant lifetime access.</li>
              <li>• Designed by {plan.creators?.full_name}.</li>
              <li>• Follow along with FyteAI diet/workout tools.</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
