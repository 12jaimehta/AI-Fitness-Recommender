"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface MacroTrackerProps {
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null;
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  onUpdate: () => void;
}

const PRIMARY_ACCENT = '#282828'; // The desired primary color

export default function MacroTracker({ nutrition, targets, onUpdate }: MacroTrackerProps) {
  // Default targets if not provided via props
  const defaultTargets = { calories: 2200, protein: 160, carbs: 250, fats: 70 };
  const finalTargets = targets || defaultTargets;
  
  const current = nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  const calculatePercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Classy, monochromatic color scheme using the PRIMARY_ACCENT and Slate shades
  const macros = [
    // Primary focus: Dark Slate Blue
    { label: 'Protein', val: current.protein, target: finalTargets.protein, color: PRIMARY_ACCENT }, 
    // Secondary: Dark Gray
    { label: 'Carbs', val: current.carbs, target: finalTargets.carbs, color: '#4b5563' }, // slate-600
    // Tertiary: Medium Gray
    { label: 'Fats', val: current.fats, target: finalTargets.fats, color: '#6b7280' }, // slate-500
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100/70 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-end mb-6 border-b border-slate-100 pb-4">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Daily Calories</p>
            <p className="text-3xl font-extrabold text-slate-800">
              {current.calories.toLocaleString()} 
              <span className="text-sm font-medium text-slate-400 ml-1">/ {finalTargets.calories} kcal</span>
            </p>
          </div>
          {/* Calorie Bar - Uses PRIMARY_ACCENT (or Red for overshoot) */}
          <div className="h-3 w-24 bg-slate-100 rounded-full overflow-hidden ring-4 ring-slate-50/0">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculatePercentage(current.calories, finalTargets.calories)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ backgroundColor: current.calories > finalTargets.calories ? '#ef4444' : PRIMARY_ACCENT }}
              className={`h-full rounded-full`}
            />
          </div>
        </div>

        <div className="space-y-5">
          {macros.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-slate-700">{m.label}</span>
                <span className="text-slate-500 font-medium">{m.val}g <span className="text-slate-300">/</span> {m.target}g</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculatePercentage(m.val, m.target)}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  style={{ backgroundColor: m.color }}
                  className={`h-full rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onUpdate} 
        style={{ color: PRIMARY_ACCENT, borderColor: PRIMARY_ACCENT + '40' }}
        className="w-full mt-8 flex items-center justify-center gap-2 text-sm font-bold hover:bg-slate-50 transition-colors border border-dashed rounded-xl py-3 group"
      >
        <Plus size={16} className="group-hover:rotate-90 transition-transform" />
        Log Meal Macros
      </button>
    </div>
  );
}