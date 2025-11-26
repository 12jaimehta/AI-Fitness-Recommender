"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/supabase-client";
import { ArrowRight, User, Dumbbell, Zap } from "lucide-react";
import { UnifiedFooter, UnifiedNavbar } from "@/components";

// ---------- TYPES ----------
interface Creator {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  category?: string | null;
  bio?: string | null;
}

interface Trainer {
  id: string;
  full_name: string;
  bio?: string | null;
  expertise?: string[] | null;
}
// ---------------------------

// Enhanced Components for better structure
const TrainerCard = ({ trainer }: { trainer: Trainer }) => (
  <motion.div
    whileHover={{ scale: 1.02, boxShadow: "0 8px 15px rgba(22, 163, 74, 0.15)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800 hover:border-green-400 transition duration-300 cursor-pointer"
  >
    <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-300 flex items-center justify-center text-xl font-bold shadow-inner mb-3 text-green-600">
      <Dumbbell size={24} />
    </div>

    <h3 className="text-lg font-bold mb-1">{trainer.full_name}</h3>
    <p className="text-sm text-gray-500 h-10 overflow-hidden line-clamp-2">
      {trainer.bio || "Certified Personal Trainer"}
    </p>

    <div className="flex flex-wrap gap-2 mt-3 mb-4">
      {(trainer.expertise || []).slice(0, 3).map((exp, i) => (
        <span
          key={i}
          className="text-xs bg-green-500/10 text-green-700 px-3 py-1 rounded-full font-medium"
        >
          {exp}
        </span>
      ))}
    </div>

    <button className="mt-2 w-full bg-green-500 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-md">
      View Profile & Hire <ArrowRight size={16} />
    </button>
  </motion.div>
);

const CreatorCard = ({ creator }: { creator: Creator }) => (
  <motion.div
    whileHover={{ scale: 1.02, boxShadow: "0 8px 15px rgba(59, 130, 246, 0.15)" }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800 hover:border-blue-400 transition duration-300 cursor-pointer"
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-300 flex items-center justify-center text-blue-600">
        <User size={24} />
      </div>

      <div>
        <h3 className="text-lg font-bold">{creator.full_name}</h3>
        <p className="text-blue-600/80 text-sm">{creator.category || "Fitness Creator"}</p>
      </div>
    </div>

    <p className="text-sm text-gray-500 h-10 overflow-hidden line-clamp-2 mb-4">
      {creator.bio || "Inspiring content creator focused on fitness and health plans."}
    </p>

    <button className="w-full bg-blue-500/10 text-blue-700 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-500/20 transition flex items-center justify-center gap-2 border border-blue-300/50">
      View Premium Plans <ArrowRight size={16} />
    </button>
  </motion.div>
);

export default function MarketplacePage() {
  const supabase = createClient();

  const [creators, setCreators] = useState<Creator[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplace();
  }, []);

  const loadMarketplace = async () => {
    setLoading(true);
    const { data: creatorData } = await supabase.from("creators").select("*").limit(6);
    const { data: trainerData } = await supabase
      .from("trainer_profiles")
      .select("*")
      .limit(3); 

    setCreators((creatorData as Creator[]) || []);
    setTrainers((trainerData as Trainer[]) || []);
    setLoading(false);
  };

  return (
    // Light Background
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavbar />

      {/* Header Section - Subtle Light Gradient */}
      <header className="h-[300px] bg-gradient-to-b from-white to-gray-50 flex flex-col justify-center items-center text-center px-6 pt-16 border-b border-gray-100">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm"
        >
          FyteConnect Marketplace
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-md md:text-lg text-gray-500 mt-4 max-w-[800px] font-light"
        >
          Your direct connection to the **best fitness resources**. Hire certified trainers and unlock premium workout plans.
        </motion.p>
      </header>

      <main className="max-w-[1300px] mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading marketplace...</div>
        ) : (
          <>
            {/* Trainers Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-green-500/30 pb-2">
                <Zap size={24} className="text-green-500" /> Elite Certified Trainers
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {trainers.map((t) => (
                  <TrainerCard key={t.id} trainer={t} />
                ))}
              </div>
            </div>

            {/* Creator Plans Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-blue-500/30 pb-2">
                <Dumbbell size={24} className="text-blue-500" /> Premium Creator Plans
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {creators.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <UnifiedFooter />
    </div>
  );
}