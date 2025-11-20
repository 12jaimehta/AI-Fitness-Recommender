"use client";

import { motion } from "framer-motion";
import { ChevronRight, Lock, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

// --- 1. AI Insight Card ---
// This sells the "Intelligence" of your platform
export const AIInsightCard = ({ title, message, type }: { title: string, message: string, type: 'warning' | 'success' | 'info' }) => {
  const colors = {
    warning: 'bg-amber-50 border-amber-100 text-amber-900',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    info: 'bg-blue-50 border-blue-100 text-blue-900',
  };
  const icons = {
    warning: <AlertCircle className="text-amber-600" size={20} />,
    success: <CheckCircle2 className="text-emerald-600" size={20} />,
    info: <Sparkles className="text-blue-600" size={20} />
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border ${colors[type]} flex gap-4 items-start`}
    >
      <div className="mt-0.5 shrink-0">{icons[type]}</div>
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
};

// --- 2. Macro Tracker ---
// Visual breakdown of nutrition. Looks professional.
export const MacroTracker = () => {
  const macros = [
    { label: 'Protein', current: 120, target: 180, color: 'bg-blue-500' },
    { label: 'Carbs', current: 210, target: 250, color: 'bg-emerald-500' },
    { label: 'Fats', current: 45, target: 65, color: 'bg-amber-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-6">
         <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Calories</p>
            <p className="text-2xl font-bold text-slate-800">1,840 <span className="text-sm font-normal text-slate-400">/ 2,200 kcal</span></p>
         </div>
         <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-800 w-[80%]"></div>
         </div>
      </div>
      
      <div className="space-y-4">
        {macros.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-slate-700">{m.label}</span>
              <span className="text-slate-500">{m.current} / {m.target}g</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(m.current / m.target) * 100}%` }}
                className={`h-full rounded-full ${m.color}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. Photo Gallery ---
// Visual progress creates emotional attachment to the app
export const PhotoGallery = () => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
            {/* Before Photo Placeholder */}
            <div className="aspect-[3/4] rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="text-xs font-bold mb-1">JAN 01</span>
                <span className="text-[10px] uppercase">Start</span>
            </div>
            {/* Current Photo Placeholder */}
            <div className="aspect-[3/4] rounded-xl bg-slate-800 relative overflow-hidden group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <div>
                        <p className="text-white text-xs font-bold">TODAY</p>
                        <p className="text-white/80 text-[10px]">78.5 kg</p>
                    </div>
                </div>
                {/* Optional: Image tag here */}
            </div>
        </div>
        <button className="w-full mt-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            View Comparison Gallery
        </button>
    </div>
  );
};

// --- 4. Premium Banner ---
// The explicit "Sell" component
export const PremiumBanner = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 shadow-lg shadow-indigo-500/25">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Lock size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded text-indigo-100">Pro Feature</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Unlock Advanced Analytics</h3>
            <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                Get metabolic rate analysis, future weight predictions, and personalized meal adjustments.
            </p>
            <button className="w-full bg-white text-indigo-700 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1">
                Upgrade to Pro <ChevronRight size={14} />
            </button>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/40 rounded-full blur-2xl"></div>
    </div>
  );
};