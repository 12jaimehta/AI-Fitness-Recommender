"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Calendar, Activity, Plus,
  Flame, Brain, Weight, Trophy, Camera // <-- FIXED: Added Camera import
} from "lucide-react";
import ProgressInput from "@/components/progress/ProgressInput";
import UserProfileSetup from "@/components/progress/user-profile";
import { useUser } from "@/lib/hooks/use-user";
import { UnifiedNavbar, UnifiedFooter } from "@/components";
import PageLoader from "@/components/ui/PageLoader";
import { generateAIInsights } from "@/components/progress/generateInsights";
import { databaseService } from "@/lib/service/progress-database";

// Imported Components
import AIInsightCard from "@/components/progress/AIInsightCards";
import MacroTracker from "@/components/progress/MacroTracker";
import PhotoGallery from "@/components/progress/PhotoGallery";
import WeightChart from "@/components/progress/WeightChart";
import MealLoggerModal from "@/components/progress/Modal/MealLogger";
import TransformationGalleryModal from "@/components/progress/Modal/TransformationGallery";



export default function ProgressPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false); // <-- Corrected State Setter Name
  const [inputType, setInputType] = useState<'weight' | 'workout' | 'goal'>('weight');
  
  // State flags for infinite loop fix and profile setup
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false); 

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
    // Only run if user is signed in AND the initial check hasn't completed yet
    if (user && isSignedIn && !initialCheckComplete) {
        loadUserData();
    }
  }, [user, isSignedIn, initialCheckComplete]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // 1. Check for Profile
      const profile = await databaseService.getUserProfile(user.id);
      
      if (!profile) { 
          // If no profile, stop loading, show setup, and mark check as done.
          setShowProfileSetup(true); 
          setInitialCheckComplete(true);
          setLoading(false);
          return; 
      }
      
      // 2. If profile exists, proceed with loading dashboard data
      setLoading(true); 
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
      // Sort photos by date descending for "latest first"
      const sortedPhotos = photoEntries ? photoEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
      setPhotos(sortedPhotos);

      const aiMessages = generateAIInsights(profile, dailyNutri, workoutEntries || []);
      setInsights(aiMessages);

      setStats([
        { label: 'Total Workouts', value: userStats?.totalWorkouts || '0', icon: Activity, color: '#10b981' },
        { label: 'Calories Burned', value: userStats?.totalCalories?.toLocaleString() || '0', icon: Flame, color: '#f59e0b' },
        { label: 'Active Streak', value: `${userStats?.activeDays || 0} Days`, icon: Calendar, color: '#3b82f6' }
      ]);
      
      setInitialCheckComplete(true); // Mark successful check as done

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
      loadUserData();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload photo");
    }
  };

  const handleLogMacrosClick = () => {
    setIsMacroModalOpen(true);
  };
  
  const handleViewGalleryClick = () => {
    if (photos.length > 0) {
      setIsGalleryModalOpen(true); // <-- FIXED: Used correct setter
    }
  };


  // 1. Auth Redirect
  if (!isSignedIn && !userLoading) {
    router.push('/sign-in');
    return null;
  }

  // 2. Profile Setup Early Exit (Guaranteed not to loop due to initialCheckComplete flag)
  if (showProfileSetup && user) {
    return (
        <UserProfileSetup 
            user={user} 
            onComplete={() => { 
                setShowProfileSetup(false); 
                // Force a reload of all data after setup completes
                setInitialCheckComplete(false); 
                setLoading(true);
            }} 
        />
    );
  }
  
  // 3. Main Loader
  const isPageLoading = (userLoading || loading || !initialCheckComplete) && !showProfileSetup;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <UnifiedNavbar />

      {isPageLoading ? (
        <div className="pt-32 flex items-center justify-center min-h-[60vh]">
          <PageLoader />
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <div className="bg-[#162a41] pt-28 pb-24 relative overflow-hidden rounded-b-[3rem] shadow-2xl">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center gap-2 mb-3 text-emerald-300 font-bold bg-emerald-900/30 w-fit px-4 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-sm">
                    <Brain size={16} />
                    <span className="text-xs tracking-wide uppercase">AI Analysis Active</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
                    Your Progress Hub
                  </h1>
                  <p className="text-blue-200/80 text-lg max-w-xl leading-relaxed font-medium">
                    {userProfile?.full_name ? `Welcome back, ${userProfile.full_name.split(' ')[0]}. ` : ''} 
                    We've tracked {weightData.length} data points to visualize your journey.
                  </p>
                </motion.div>

                <div className="flex gap-3">
                  <button onClick={() => {
                    setInputType('weight');
                    setIsInputOpen(true);
                  }}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 border border-white/10 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <TrendingUp size={20} /> Log Weight
                  </button>
                  <button onClick={() => {
                    setInputType('workout');
                    setIsInputOpen(true);
                  }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 hover:-translate-y-1"
                  >
                    <Plus size={20} /> Log Activity
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Content */}
          <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
            {/* 1. Top Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between h-36 group hover:border-slate-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110" style={{ background: `${stat.color}15`, color: stat.color }}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                  </div>
                </div>
              ))}

              {/* Highlighted Current Weight Card */}
              <div className="bg-[#162a41] p-6 rounded-2xl shadow-xl shadow-blue-900/20 text-white flex flex-col justify-between h-36 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-blue-200/80 text-xs font-bold uppercase tracking-wider mb-1">Current Weight</p>
                  <p className="text-4xl font-black mt-1">{weightData[0]?.weight || userProfile?.initial_weight || '--'} <span className="text-xl font-medium text-blue-300">kg</span></p>
                </div>
                <div className="relative z-10 text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-500/10 w-fit px-2 py-1 rounded-lg">
                  <TrendingUp size={14} />
                  <span>Latest Entry</span>
                </div>
                <div className="absolute -right-6 -bottom-6 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <Weight size={120} />
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column (Main Data) */}
              <div className="lg:col-span-2 space-y-8">

                {/* AI Insights */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
                      <Brain className="text-indigo-600" size={24} />
                      AI Coach Insights
                    </h3>
                    <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide animate-pulse">Live Analysis</span>
                  </div>
                  <div className="grid gap-4">
                    {insights.length > 0 ? (
                       insights.map((insight, idx) => (
                        <AIInsightCard key={idx} {...insight} />
                      ))
                    ) : (
                      <div className="p-6 bg-white rounded-xl border border-slate-100 text-center text-slate-400 text-sm">
                        Log more data to generate personalized AI insights.
                      </div>
                    )}
                  </div>
                </section>

                {/* Nutrition Tracker */}
                <section>
                   <h3 className="text-xl font-extrabold text-slate-800 mb-4">Daily Nutrition</h3>
                   <MacroTracker nutrition={nutritionData} onUpdate={handleLogMacrosClick} />
                </section>

                {/* Weight Chart */}
                <section>
                   <WeightChart data={weightData} />
                </section>
              </div>

              {/* Right Column (Visuals & Gamification) */}
              <div className="space-y-8">
                {/* Photos */}
                <section>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-2">
                    <Camera size={22} className="text-slate-400" />
                    Body Transformation
                  </h3>
                  <PhotoGallery 
                    photos={photos} 
                    onUpload={handlePhotoUpload} 
                    onViewGallery={handleViewGalleryClick}
                  />
                </section>

                {/* Gamification Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="text-yellow-300" size={24} fill="currentColor" />
                        <h4 className="font-black text-xl">Consistency King</h4>
                    </div>
                    <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                      You are in the top <span className="font-bold text-white">15%</span> of users this week! Log one more workout to unlock the "Weekend Warrior" badge.
                    </p>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-indigo-200">
                            <span>Level 5 Progress</span>
                            <span>85%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
                            <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 w-[85%] h-full rounded-full shadow-lg"></div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Decorative circles */}
                  <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Modals */}
          <ProgressInput
            isOpen={isInputOpen}
            onClose={() => setIsInputOpen(false)}
            onSubmit={() => { loadUserData(); }}
            inputType={inputType}
          />
          
          <MealLoggerModal 
            isOpen={isMacroModalOpen}
            onClose={() => setIsMacroModalOpen(false)} // <-- FIXED: Used correct setter
            onLog={loadUserData} 
            initialNutrition={nutritionData}
          />
          
          <TransformationGalleryModal
            isOpen={isGalleryModalOpen}
            onClose={() => setIsGalleryModalOpen(false)} // <-- FIXED: Used correct setter
            photos={photos}
          />

          <div className="mt-20">
            <UnifiedFooter />
          </div>
        </>
      )}
    </div>
  );
}