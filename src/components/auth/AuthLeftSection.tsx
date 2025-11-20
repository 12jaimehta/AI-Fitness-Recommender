// components/auth/AuthLeftSection.tsx
"use client";

import { motion } from "framer-motion";
import { Dumbbell, Apple, Heart } from "lucide-react";

export default function AuthLeftSection() {
  const features = [
    {
      icon: Dumbbell,
      title: "Personalized Workouts",
      description: "AI-powered workout plans tailored to your goals and fitness level",
    },
    {
      icon: Apple,
      title: "Smart Nutrition Plans",
      description: "Custom diet plans that adapt to your preferences and progress",
    },
    {
      icon: Heart,
      title: "Progress Analytics",
      description: "Track your journey with detailed insights and achievements",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "95%", label: "Success Rate" },
    { number: "50K+", label: "Workouts" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="text-white p-8"
    >
      <h1 className="text-[3.5rem] font-extrabold leading-[1.1] mb-4 bg-clip-text text-transparent bg-[linear-gradient(135deg,#ffffff_0%,rgba(255,255,255,0.8)_100%)]">
        Start Your Fitness Journey
      </h1>

      <p className="text-xl opacity-90 mb-12 leading-relaxed">
        Join thousands of users transforming their lives with personalized AI-powered fitness and nutrition plans.
      </p>

      <div className="flex flex-col gap-8">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className="flex items-center gap-4"
            >
              <div className="w-[60px] h-[60px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Icon size={28} className="text-white" />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                <p className="text-sm opacity-80">{feature.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex gap-6 md:gap-10 justify-between"
      >
        {stats.map((stat) => (
          <div key={stat.label} className="text-center flex-1">
            <div className="text-xl md:text-2xl font-extrabold mb-1">{stat.number}</div>
            <div className="text-xs md:text-sm opacity-80">{stat.label}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
