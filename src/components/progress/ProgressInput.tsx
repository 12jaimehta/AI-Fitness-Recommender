"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Weight, Activity, Target } from "lucide-react";

interface ProgressInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  inputType: 'weight' | 'workout' | 'goal';
}

export default function ProgressInput({ isOpen, onClose, onSubmit, inputType }: ProgressInputProps) {
  const [formData, setFormData] = useState({
    // Weight form data
    weight: '',
    date: new Date().toISOString().split('T')[0],

    // Workout form data
    workoutType: '',
    duration: '',
    calories: '',
    notes: '',

    // Goal form data
    goalTitle: '',
    goalTarget: '',
    goalUnit: '',
    goalCategory: 'weight'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      type: inputType,
      goalUnit: goalUnits[formData.goalCategory as keyof typeof goalUnits] 
    };

    onSubmit(submitData);
    setFormData({
      weight: '',
      date: new Date().toISOString().split('T')[0],
      workoutType: '',
      duration: '',
      calories: '',
      notes: '',
      goalTitle: '',
      goalTarget: '',
      goalUnit: '',
      goalCategory: 'weight'
    });
    onClose();
  };

  const workoutTypes = [
    'Cardio', 'Strength Training', 'Yoga', 'Running', 'Cycling',
    'Swimming', 'HIIT', 'Walking', 'Sports', 'Other'
  ];

  const goalUnits: { [key: string]: string } = {
    weight: 'kg',
    workout: 'days/week',
    calories: 'cal/week',
    duration: 'min/day'
  };

  // Shared class strings for cleaner JSX
  const inputLabelClass = "block text-sm font-semibold text-[#162a41] mb-2";
  const inputFieldClass = "w-full p-3 rounded-xl border border-[#162a41]/20 text-base transition-all duration-300 focus:border-[#162a41] focus:ring-2 focus:ring-[#162a41]/10 outline-none bg-white";

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-5"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto rounded-[20px] bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              {inputType === 'weight' && <Weight size={24} className="text-[#162a41]" />}
              {inputType === 'workout' && <Activity size={24} className="text-[#162a41]" />}
              {inputType === 'goal' && <Target size={24} className="text-[#162a41]" />}

              <h2 className="text-2xl font-bold text-[#162a41] m-0">
                {inputType === 'weight' && 'Log Weight'}
                {inputType === 'workout' && 'Add Workout'}
                {inputType === 'goal' && 'Set New Goal'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="bg-transparent border-none cursor-pointer p-2 rounded-lg transition-all duration-300 hover:bg-[#162a41]/10"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {inputType === 'weight' && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={inputLabelClass}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className={inputLabelClass}>Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>
              </div>
            )}

            {inputType === 'workout' && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={inputLabelClass}>Workout Type</label>
                  <select
                    required
                    value={formData.workoutType}
                    onChange={(e) => setFormData({ ...formData, workoutType: e.target.value })}
                    className={`${inputFieldClass} cursor-pointer`}
                  >
                    <option value="">Select workout type</option>
                    {workoutTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={inputLabelClass}>Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className={inputLabelClass}>Calories Burned</label>
                  <input
                    type="number"
                    required
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className={inputLabelClass}>Notes (optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="How did you feel? Any achievements?"
                    rows={3}
                    className={`${inputFieldClass} resize-y`}
                  />
                </div>
              </div>
            )}

            {inputType === 'goal' && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className={inputLabelClass}>Goal Category</label>
                  <select
                    required
                    value={formData.goalCategory}
                    onChange={(e) => setFormData({ ...formData, goalCategory: e.target.value })}
                    className={`${inputFieldClass} cursor-pointer`}
                  >
                    <option value="weight">Weight Loss</option>
                    <option value="workout">Workout Frequency</option>
                    <option value="calories">Calorie Burn</option>
                    <option value="duration">Exercise Duration</option>
                  </select>
                </div>

                <div>
                  <label className={inputLabelClass}>Goal Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lose 10 kg, Workout 5 times a week"
                    value={formData.goalTitle}
                    onChange={(e) => setFormData({ ...formData, goalTitle: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className={inputLabelClass}>Target Value</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g., 10, 5, 2000"
                    value={formData.goalTarget}
                    onChange={(e) => setFormData({ ...formData, goalTarget: e.target.value })}
                    className={inputFieldClass}
                  />
                </div>

                <div>
                  <label className={inputLabelClass}>Unit</label>
                  <input
                    type="text"
                    required
                    value={goalUnits[formData.goalCategory as keyof typeof goalUnits]}
                    readOnly
                    className="w-full p-3 rounded-xl border border-[#162a41]/20 text-base bg-[#162a41]/5 text-gray-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-xl border-none bg-[#162a41] text-white text-base font-semibold cursor-pointer transition-colors duration-300 hover:bg-[#1e3a5f]"
              >
                {inputType === 'weight' && 'Log Weight'}
                {inputType === 'workout' && 'Add Workout'}
                {inputType === 'goal' && 'Set Goal'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}