"use client";

import { Dumbbell, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function TrainerLeftSection() {
  return (
    <div className="text-white space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium mb-4 border border-white/20">
          <Sparkles className="w-3 h-3 text-yellow-300" />
          FyteConnect for Trainers
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3">
          Turn your <span className="text-emerald-300">fitness expertise</span>{" "}
          into real impact.
        </h1>
        <p className="text-sm md:text-base text-white/80 max-w-md">
          Join FyteConnect as a trainer and get discovered by people looking for
          personalized diet and workout guidance. Build your brand, one client
          at a time.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-4 max-w-md"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-400/20 flex items-center justify-center mb-3">
            <Dumbbell className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-xs text-white/60 mb-1">1:1 Coaching</p>
          <p className="text-sm font-semibold">
            Offer customized diet & training plans.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/15 p-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-400/20 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-indigo-200" />
          </div>
          <p className="text-xs text-white/60 mb-1">Grow Your Brand</p>
          <p className="text-sm font-semibold">
            Get discovered by serious fitness seekers.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
