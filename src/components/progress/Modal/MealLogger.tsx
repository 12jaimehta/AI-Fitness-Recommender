"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Utensils } from "lucide-react";
import { useState } from "react";
import { databaseService } from "@/lib/service/progress-database";
import { useUser } from "@/lib/hooks/use-user";

interface MealLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLog: () => void; // Function to trigger data refresh in parent
  initialNutrition?: { calories: number; protein: number; carbs: number; fats: number };
}

export default function MealLoggerModal({ isOpen, onClose, onLog, initialNutrition }: MealLoggerModalProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    calories: initialNutrition?.calories || 0,
    protein: initialNutrition?.protein || 0,
    carbs: initialNutrition?.carbs || 0,
    fats: initialNutrition?.fats || 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async () => {
    if (!user) {
      alert("User not signed in.");
      return;
    }

    if (formData.calories <= 0) {
      alert("Calories must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      // Update or create the daily nutrition entry
      await databaseService.updateDailyNutrition(user.id, {
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fats: formData.fats,
      });
      
      onLog(); // Refresh data in ProgressPage
      onClose(); // Close the modal
      
    } catch (error) {
      console.error("Error logging nutrition:", error);
      alert("Failed to log nutrition data.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full p-3 rounded-xl border border-[#162a41]/20 text-base transition-all duration-200 focus:border-[#162a41] focus:ring-2 focus:ring-[#162a41]/10 outline-none";
  const labelClass = "block text-sm font-semibold text-[#162a41] mb-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                <Utensils size={24} />
              </div>
              <h2 className="text-2xl font-black text-[#162a41]">Log Daily Nutrition</h2>
              <p className="text-sm text-slate-500 mt-1">Enter your total consumption for today.</p>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Calories (kcal)</label>
                  <input
                    type="number"
                    name="calories"
                    value={formData.calories === 0 ? "" : formData.calories}
                    onChange={handleInputChange}
                    placeholder="e.g. 2100"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Protein (g)</label>
                  <input
                    type="number"
                    name="protein"
                    value={formData.protein === 0 ? "" : formData.protein}
                    onChange={handleInputChange}
                    placeholder="e.g. 150"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Carbs (g)</label>
                  <input
                    type="number"
                    name="carbs"
                    value={formData.carbs === 0 ? "" : formData.carbs}
                    onChange={handleInputChange}
                    placeholder="e.g. 230"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Fats (g)</label>
                  <input
                    type="number"
                    name="fats"
                    value={formData.fats === 0 ? "" : formData.fats}
                    onChange={handleInputChange}
                    placeholder="e.g. 60"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || formData.calories <= 0}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-[#162a41] text-white font-bold p-4 rounded-xl transition-all hover:bg-[#1e3a5f] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Utensils size={20} className="animate-pulse" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Nutrition</span>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}