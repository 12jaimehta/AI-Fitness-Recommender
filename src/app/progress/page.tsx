"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Calendar, Activity, Plus,
  Flame, Brain, Camera, Sparkles, Upload, X,
  Weight
} from "lucide-react";
import ProgressInput from "@/components/progress/ProgressInput";
import UserProfileSetup from "@/components/progress/user-profile";
import { useUser } from "@/lib/hooks/use-user";
import { UnifiedFooter } from "@/components";
import PageLoader from "@/components/ui/PageLoader";
import { generateAIInsights } from "@/components/progress/generateInsights";
import { databaseService } from "@/lib/service/progress-database";

// --- Sub-Components (Integrated dynamically) ---

const AIInsightCard = ({ title, message, type }: { title: string, message: string, type: 'warning' | 'success' | 'info' }) => {
  const colors = {
    warning: 'bg-amber-50 border-amber-100 text-amber-900',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    info: 'bg-blue-50 border-blue-100 text-blue-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-xl border ${colors[type]} flex gap-4 items-start shadow-sm`}
    >
      <div className="mt-0.5 shrink-0">
        <Sparkles size={18} className={type === 'warning' ? 'text-amber-600' : type === 'success' ? 'text-emerald-600' : 'text-blue-600'} />
      </div>
      <div>
        <h4 className="font-bold text-sm mb-1">{title}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
};

const MacroTracker = ({ nutrition, onUpdate }: { nutrition: any, onUpdate: () => void }) => {
  // Default targets (In real app, fetch from user profile)
  const targets = { calories: 2200, protein: 160, carbs: 250, fats: 70 };
  const current = nutrition || { calories: 0, protein: 0, carbs: 0, fats: 0 };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase">Daily Calories</p>
          <p className="text-2xl font-bold text-slate-800">
            {current.calories.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {targets.calories} kcal</span>
          </p>
        </div>
        <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((current.calories / targets.calories) * 100, 100)}%` }}
            className="h-full bg-slate-800"
          />
        </div>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Protein', val: current.protein, target: targets.protein, color: 'bg-blue-500' },
          { label: 'Carbs', val: current.carbs, target: targets.carbs, color: 'bg-emerald-500' },
          { label: 'Fats', val: current.fats, target: targets.fats, color: 'bg-amber-500' },
        ].map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-slate-700">{m.label}</span>
              <span className="text-slate-500">{m.val} / {m.target}g</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((m.val / m.target) * 100, 100)}%` }}
                className={`h-full rounded-full ${m.color}`}
              />
            </div>
          </div>
        ))}
      </div>
      <button onClick={onUpdate} className="w-full mt-6 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors border border-dashed border-slate-300 rounded-lg py-2">
        + Log Meal Macros
      </button>
    </div>
  );
};

const PhotoGallery = ({ photos, onUpload }: { photos: any[], onUpload: (e: any) => void }) => {
  const beforePhoto = photos[photos.length - 1]; // Oldest photo
  const currentPhoto = photos[0]; // Newest photo

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Start Photo */}
        <div className="aspect-[3/4] rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative">
          {beforePhoto ? (
            <img src={beforePhoto.photo_url} alt="Start" className="w-full h-full object-cover" />
          ) : (
            <div className="text-center p-2">
              <span className="text-xs font-bold text-slate-400 block mb-1">START</span>
              <Camera size={20} className="text-slate-300 mx-auto" />
            </div>
          )}
          {beforePhoto && <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 text-center">Day 1</div>}
        </div>

        {/* Recent Photo */}
        <div className="aspect-[3/4] rounded-xl bg-slate-800 relative overflow-hidden group cursor-pointer">
          {currentPhoto ? (
            <img src={currentPhoto.photo_url} alt="Current" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/50">
              <span className="text-xs">No recent photo</span>
            </div>
          )}

          <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} />
            <div className="text-white flex flex-col items-center gap-1">
              <Upload size={20} />
              <span className="text-xs font-bold">Update</span>
            </div>
          </label>
        </div>
      </div>
      <div className="flex justify-between items-center text-xs text-slate-500 px-1">
        <span>Transformation view</span>
        <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Free Unlocked</span>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function ProgressPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [inputType, setInputType] = useState<'weight' | 'workout' | 'goal'>('weight');
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  // Data State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isSignedIn) loadUserData();
  }, [user, isSignedIn]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const profile = await databaseService.getUserProfile(user.id);
      if (!profile) { setShowProfileSetup(true); return; }
      setUserProfile(profile);

      const today = new Date().toISOString().split('T')[0];

      const [weightEntries, workoutEntries, dailyNutri, photoEntries, userStats] = await Promise.all([
        databaseService.getWeightEntries(user.id),
        databaseService.getWorkoutEntries(user.id),
        databaseService.getDailyNutrition(user.id, today),
        databaseService.getProgressPhotos(user.id),
        databaseService.getUserStats(user.id)
      ]);

      setWeightData(weightEntries || []);
      setWorkoutData(workoutEntries || []);
      setNutritionData(dailyNutri);
      setPhotos(photoEntries || []);

      // Generate Dynamic AI Insights
      const aiMessages = generateAIInsights(profile, dailyNutri, workoutEntries || []);
      setInsights(aiMessages);

      setStats([
        { label: 'Total Workouts', value: userStats?.totalWorkouts || '0', icon: Activity, color: '#10b981' },
        { label: 'Calories Burned', value: userStats?.totalCalories?.toLocaleString() || '0', icon: Flame, color: '#f59e0b' },
        { label: 'Active Streak', value: '3 Days', icon: Calendar, color: '#3b82f6' } // You can calculate real streak later
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    try {
      await databaseService.uploadProgressPhoto(user.id, e.target.files[0]);
      loadUserData(); // Refresh to show new photo
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload photo");
    }
  };

  // Mock function to log random macros for demo purposes
  const handleLogMacros = async () => {
    if (!user) return;
    // In reality, open a modal to input these
    const demoMacros = { calories: 1850, protein: 130, carbs: 200, fats: 55 };
    await databaseService.updateDailyNutrition(user.id, demoMacros);
    loadUserData();
  };

  if (userLoading || loading) return <PageLoader />;
  if (showProfileSetup && user) return <UserProfileSetup user={user} onComplete={() => { setShowProfileSetup(false); loadUserData(); }} />;
  if (!isSignedIn && !userLoading) { router.push('/sign-in'); return null; }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium-Feel Header */}
      <div className="bg-[#162a41] pt-24 pb-20 relative overflow-hidden rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-medium bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                <Brain size={16} />
                <span className="text-sm">AI Analysis Active</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">
                Progress Hub
              </h1>
              <p className="text-blue-200 text-lg max-w-xl">
                Tracking {weightData.length} data points. AI is analyzing your trends in real-time.
              </p>
            </motion.div>

            <div className="flex gap-3">
              <button onClick={() => {
                setInputType('weight');
                setIsInputOpen(true);
              }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 border border-white/10">
                <TrendingUp size={18} /> Log Weight
              </button>
              <button onClick={() => {
                setInputType('workout');
                setIsInputOpen(true);
              }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
                <Plus size={18} /> Log Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-32">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: `${stat.color}15`, color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}

          {/* Live Weight Card */}
          <div className="bg-[#162a41] p-5 rounded-2xl shadow-lg text-white flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">Current Weight</p>
              <p className="text-3xl font-bold mt-1">{weightData[0]?.weight || userProfile?.initial_weight || '--'} <span className="text-lg font-medium text-blue-300">kg</span></p>
            </div>
            <div className="relative z-10 text-emerald-400 text-xs font-medium flex items-center gap-1">
              <TrendingUp size={14} />
              <span>Latest Entry</span>
            </div>
            {/* Background decoration */}
            <div className="absolute -right-4 -bottom-4 text-white/5">
              <Weight size={100} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* AI Insights Section - Fully Dynamic */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Brain className="text-indigo-600" size={24} />
                  AI Coach Insights
                </h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">LIVE</span>
              </div>
              <div className="grid gap-4">
                {insights.map((insight, idx) => (
                  <AIInsightCard key={idx} {...insight} />
                ))}
              </div>
            </section>

            {/* Macro Tracker */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800">Daily Nutrition</h3>
                <button className="text-sm text-slate-500 hover:text-slate-800">Details</button>
              </div>
              <MacroTracker nutrition={nutritionData} onUpdate={handleLogMacros} />
            </section>

            {/* Weight Chart Area */}
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Weight History</h3>
              <div className="h-48 flex items-end gap-2">
                {weightData.slice(0, 10).reverse().map((entry, i) => (
                  <div key={i} className="flex-1 bg-blue-50 rounded-t-lg relative group hover:bg-blue-100 transition-colors" style={{ height: `${(entry.weight / 150) * 100}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {entry.weight}kg
                    </div>
                  </div>
                ))}
                {weightData.length === 0 && <div className="w-full text-center text-slate-400 pt-20">No data yet</div>}
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Photo Gallery */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Body Transformation</h3>
                <Camera size={18} className="text-slate-400" />
              </div>
              <PhotoGallery photos={photos} onUpload={handlePhotoUpload} />
            </section>

            {/* Motivation / Gamification */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h4 className="font-bold text-lg mb-2">Keep it up!</h4>
              <p className="text-indigo-100 text-sm mb-4">You are in the top 15% of consistent users this week. Log one more workout to reach the next tier.</p>
              <div className="w-full bg-black/20 rounded-full h-2">
                <div className="bg-white w-[85%] h-full rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProgressInput
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onSubmit={() => { loadUserData(); setIsInputOpen(false); }}
        inputType={inputType}
      />
      <div className="mt-20">
        <UnifiedFooter />
      </div>
    </div>
  );
}