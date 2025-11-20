"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { databaseService, UserProfile } from "@/lib/service/progress-database";
import { Loader2, Check } from "lucide-react";

interface UserProfileSetupProps {
  user: any;
  onComplete: () => void;
}

export default function UserProfileSetup({ user, onComplete }: UserProfileSetupProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    initial_weight: '',
    fitness_level: '',
    goals: [] as string[]
  });

  const fitnessLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const goalOptions = [
    'Weight Loss',
    'Muscle Gain',
    'Improved Endurance',
    'Better Health',
    'Stress Relief',
    'Sports Performance'
  ];

  // Shared styling classes
  const labelClass = "block text-sm font-semibold text-[#162a41] mb-2";
  const inputClass = "w-full p-3 rounded-xl border border-[#162a41]/20 text-base bg-white transition-all duration-200 focus:border-[#162a41] focus:ring-2 focus:ring-[#162a41]/10 outline-none";
  const selectClass = "w-full p-3 rounded-xl border border-[#162a41]/20 text-base bg-white transition-all duration-200 focus:border-[#162a41] outline-none cursor-pointer appearance-none";

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const profileData: Omit<UserProfile, 'created_at' | 'updated_at'> = {
        id: user.id,
        email: user.email!,
        full_name: profile.full_name,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        height: profile.height ? parseFloat(profile.height) : null,
        initial_weight: profile.initial_weight ? parseFloat(profile.initial_weight) : null,
        fitness_level: profile.fitness_level || null,
        goals: profile.goals
      };

      const result = await databaseService.createUserProfile(profileData);
      
      if (result) {
        // Also create initial weight entry automatically
        if (profile.initial_weight) {
          await databaseService.addWeightEntry({
            user_id: user.id,
            weight: parseFloat(profile.initial_weight),
            date: new Date().toISOString().split('T')[0],
            notes: 'Initial starting weight'
          });
        }

        onComplete();
        router.refresh();
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-5 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-[20px] p-8 md:p-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-[#162a41] mb-2 tracking-tight">
            Welcome to fyteAI!
          </h2>
          <p className="text-gray-500 text-base">
            Let's set up your profile to personalize your experience.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-5"
            >
              <h3 className="text-xl font-bold text-[#162a41] border-b border-gray-100 pb-2">
                Basic Information
              </h3>

              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => updateProfile('full_name', e.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => updateProfile('age', e.target.value)}
                    placeholder="Age"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Gender</label>
                  <div className="relative">
                    <select
                      value={profile.gender}
                      onChange={(e) => updateProfile('gender', e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.height}
                    onChange={(e) => updateProfile('height', e.target.value)}
                    placeholder="e.g. 175"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={profile.initial_weight}
                    onChange={(e) => updateProfile('initial_weight', e.target.value)}
                    placeholder="e.g. 70"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!profile.full_name || !profile.initial_weight}
                className="mt-6 w-full p-4 rounded-xl bg-[#162a41] text-white font-bold text-base transition-all hover:bg-[#1e3a5f] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* Step 2: Fitness Level & Goals */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              <h3 className="text-xl font-bold text-[#162a41] border-b border-gray-100 pb-2">
                Fitness & Goals
              </h3>

              {/* Fitness Level Selection */}
              <div>
                <label className={labelClass}>Fitness Level</label>
                <div className="flex flex-col gap-3">
                  {fitnessLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => updateProfile('fitness_level', level.value)}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between
                        ${profile.fitness_level === level.value 
                          ? 'border-[#162a41] bg-[#162a41]/5 text-[#162a41]' 
                          : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300'}
                      `}
                    >
                      <span className="font-semibold">{level.label}</span>
                      {profile.fitness_level === level.value && (
                        <Check size={18} className="text-[#162a41]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Goals Selection */}
              <div>
                <label className={labelClass}>Your Goals (Select all that apply)</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {goalOptions.map(goal => {
                    const isSelected = profile.goals.includes(goal);
                    return (
                      <label
                        key={goal}
                        className={`
                          flex items-center gap-3 p-3.5 rounded-lg border cursor-pointer transition-all duration-200
                          ${isSelected 
                            ? 'border-[#162a41] bg-[#162a41]/5 shadow-sm' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'}
                        `}
                      >
                        <div className={`
                          w-5 h-5 rounded border flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-[#162a41] border-[#162a41]' : 'border-gray-300 bg-white'}
                        `}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleGoal(goal)}
                          className="hidden"
                        />
                        <span className={`font-medium ${isSelected ? 'text-[#162a41]' : 'text-gray-600'}`}>
                          {goal}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 p-4 rounded-xl border border-[#162a41]/20 text-[#162a41] font-bold hover:bg-[#162a41]/5 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !profile.fitness_level || profile.goals.length === 0}
                  className="flex-1 p-4 rounded-xl bg-[#162a41] text-white font-bold transition-all hover:bg-[#1e3a5f] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}