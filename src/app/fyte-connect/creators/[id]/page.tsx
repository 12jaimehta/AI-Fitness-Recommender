"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/supabase-client";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Star, Flame, Clock } from "lucide-react";
import RatingReview from "@/components/fyte-connect/RatingReview";

interface Creator {
  id: string;
  full_name: string;
  avatar_url: string | null;
  category: string | null;
  bio: string | null;
}

interface Plan {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_weeks: number | null;
  difficulty: string | null;
  cover_image: string | null;
}

export default function CreatorPlansPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const creatorId = params?.id as string;

  const [creator, setCreator] = useState<Creator | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    if (!creatorId) return;

    const loadData = async () => {
      // Load creator
      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("id", creatorId)
        .single();

      setCreator(creatorData as any);

      // Load plans
      const { data: planData } = await supabase
        .from("creator_plans")
        .select("*")
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      setPlans(planData || []);
    };

    loadData();
  }, [creatorId]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-[#0f1c2f] text-white flex items-center justify-center">
        Loading creator...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1c2f] text-white pb-20">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div className="flex items-center gap-4">
            {creator.avatar_url ? (
              <img
                src={creator.avatar_url}
                alt={creator.full_name}
                className="w-16 h-16 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center text-2xl font-bold">
                {creator.full_name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-white/60">
                FyteConnect Creator
              </p>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                {creator.full_name}
              </h1>
              <p className="text-xs text-white/60 mt-1">
                {creator.category || "Fitness Creator"}
              </p>
            </div>
          </div>

          <div className="max-w-[480px] text-sm text-white/70">
            {creator.bio}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ scale: 1.03 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col"
            >
              {plan.cover_image && (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={plan.cover_image}
                    alt={plan.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold">{plan.title}</h2>
                  <span className="text-xs bg-white/10 px-2 py-1 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-300" />
                    {plan.difficulty || "All levels"}
                  </span>
                </div>

                {plan.duration_weeks && (
                  <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{plan.duration_weeks} weeks</span>
                  </div>
                )}

                <p className="text-xs text-white/70 mb-4 line-clamp-3">
                  {plan.description}
                </p>

                <div className="mt-auto pt-3 flex items-center justify-between">
                  <p className="text-lg font-bold">₹{plan.price}</p>
                  <button
                    onClick={() =>
                      router.push(`/fyte-connect/checkout/${plan.id}`)
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-[#282828] hover:bg-[#1d3b61]"
                  >
                    View & Buy <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {plans.length === 0 && (
            <p className="text-sm text-white/50 col-span-full">
              No plans available yet.
            </p>
          )}
        </div>

        <RatingReview targetType="creator" targetId={creator.id} />
      </div>
    </div>
  );
}
