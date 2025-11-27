"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Calendar, Activity, Plus,
  Flame, Brain, Weight, Trophy, Camera
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

// Custom Tailwind Shadow for a sleek, floating look
const sleekShadow = 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] transition-shadow duration-300';
const darkSleekShadow = 'shadow-2xl shadow-slate-950/20';

// Unified Accent Colors
const PRIMARY_ACCENT = '#282828'; // The new dark slate blue
const WARNING_ACCENT = '#f59e0b'; // Amber 500 (only for necessary warnings/energy)


export default function ProgressPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  
  // --- STATE DEFINITIONS (Must be unconditional and at the top) ---
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [inputType, setInputType] = useState<'weight' | 'workout' | 'goal'>('weight');
  
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false); 

  // Data State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // --- END STATE DEFINITIONS ---


  // --- Core Data Fetching Function ---
  const loadUserData = async (force: boolean = false) => {
    if (!user) return; 
    
    setLoading(true);

    try {
      // 1. Check for Profile
      const profile = await databaseService.getUserProfile(user.id);
      
      if (!profile) { 
          setShowProfileSetup(true); 
          return; 
      }
      
      // 2. If profile exists, proceed with loading dashboard data
      setShowProfileSetup(false); 
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
      
      const sortedPhotos = photoEntries ? photoEntries.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
      setPhotos(sortedPhotos);

      const aiMessages = generateAIInsights(profile, dailyNutri, workoutEntries || []);
      setInsights(aiMessages);

      // Accent color is applied via style={...} using the PRIMARY_ACCENT constant
      setStats([
        { label: 'Total Workouts', value: userStats?.totalWorkouts || '0', icon: Activity, color: PRIMARY_ACCENT }, 
        { label: 'Calories Burned', value: userStats?.totalCalories?.toLocaleString() || '0', icon: Flame, color: WARNING_ACCENT }, // Amber for warning/energy
        { label: 'Active Streak', value: `${userStats?.activeDays || 0} Days`, icon: Calendar, color: PRIMARY_ACCENT } 
      ]);
      
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
      if (!initialLoadAttempted) {
          setInitialLoadAttempted(true); 
      }
    }
  };

  // --- Main Effect for Auth/Redirect and Data Load (UNCONDITIONAL HOOK) ---
  useEffect(() => {
    if (!userLoading && !isSignedIn) {
      router.push('/sign-in');
      return;
    }
    
    if (user && isSignedIn && !userLoading && !initialLoadAttempted) {
        loadUserData();
    }
  }, [user, isSignedIn, userLoading, initialLoadAttempted, router]);


  // --- Handler to Refresh All Data ---
  const handleDataRefresh = () => {
    loadUserData(true); 
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    try {
      await databaseService.uploadProgressPhoto(user.id, e.target.files[0]);
      handleDataRefresh(); 
    } catch (error) {
      console.error("Upload failed", error);
      console.error("Failed to upload photo");
    }
  };

  const handleLogMacrosClick = () => {
    setIsMacroModalOpen(true);
  };
  
  const handleViewGalleryClick = () => {
    if (photos.length > 0) {
      setIsGalleryModalOpen(true);
    }
  };


  // --- RENDER GUARDS ---

  const isPageLoading = userLoading || loading;
  if (isPageLoading && !showProfileSetup) {
    return (
        <PageLoader />
    );
  }

  if (showProfileSetup && user) {
    return (
        <UserProfileSetup 
            user={user} 
            onComplete={() => { 
                setShowProfileSetup(false); 
                setInitialLoadAttempted(false); 
                setLoading(true);
            }} 
        />
    );
  }
  
  // 3. Main Dashboard Render
  return (
    <div className="min-h-screen bg-slate-50">
      <UnifiedNavbar />

      {/* Hero Header - Sleek Dark Theme using PRIMARY_ACCENT */}
      <div style={{ backgroundColor: PRIMARY_ACCENT }} className="pt-28 pb-24 relative overflow-hidden rounded-b-[3rem] shadow-2xl">
        {/* Background Elements - Subtler, tonal shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50">
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full bg-slate-700/10 blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {/* AI Analysis Tag - Refined, using light primary accent */}
              <div className="flex items-center gap-2 mb-3 text-slate-300 font-bold bg-white/10 w-fit px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                <Brain size={16} />
                <span className="text-xs tracking-wider uppercase">AI Analysis Active</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">
                Your Progress Hub
              </h1>
              <p className="text-slate-300/80 text-lg max-w-xl leading-relaxed font-medium">
                {userProfile?.full_name ? `Welcome back, ${userProfile.full_name.split(' ')[0]}. ` : ''} 
                Visualizing {weightData.length} data points to track your commitment.
              </p>
            </motion.div>

            <div className="flex gap-3">
              {/* Sleek, muted button (Light accent) */}
              <button onClick={() => {
                setInputType('weight');
                setIsInputOpen(true);
              }}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-6 py-4 rounded-xl font-bold transition-all flex items-center gap-2 border border-white/10 hover:-translate-y-0.5"
              >
                <TrendingUp size={20} /> Log Weight
              </button>
              {/* Primary accent button - now using the custom color */}
              <button onClick={() => {
                setInputType('workout');
                setIsInputOpen(true);
              }}
                style={{ backgroundColor: 'white', color: PRIMARY_ACCENT }}
                className="hover:bg-slate-100 px-6 py-4 rounded-xl font-black shadow-lg shadow-black/10 transition-all flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Plus size={20} /> Log Activity
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {/* 1. Top Stats Grid - Using sleekShadow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white p-6 rounded-xl ${sleekShadow} border border-slate-100 flex flex-col justify-between h-36 group`}>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-105" 
                style={{ background: stat.color === PRIMARY_ACCENT ? '#28282815' : '#f59e0b15', color: stat.color }}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}

          {/* Highlighted Current Weight Card - Premium Dark Look (using PRIMARY_ACCENT) */}
          <div style={{ backgroundColor: PRIMARY_ACCENT }} className={`p-6 rounded-xl ${darkSleekShadow} text-white flex flex-col justify-between h-36 relative overflow-hidden group`}>
            <div className="relative z-10">
              <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Current Weight</p>
              <p className="text-4xl font-black mt-1">{weightData[0]?.weight || userProfile?.initial_weight || '--'} <span className="text-xl font-medium text-slate-400">kg</span></p>
            </div>
            <div className="relative z-10 text-slate-400 text-xs font-bold flex items-center gap-1 bg-white/10 w-fit px-2 py-1 rounded-md">
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
                  <Brain style={{ color: PRIMARY_ACCENT }} size={24} />
                  AI Coach Insights
                </h3>
                <span style={{ backgroundColor: '#28282810', color: PRIMARY_ACCENT }} className=" border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Live Analysis</span>
              </div>
              <div className="grid gap-4">
                {insights.length > 0 ? (
                   insights.map((insight, idx) => (
                    // Note: AIInsightCard styles are assumed to be simple and neutral
                    <AIInsightCard key={idx} {...insight} />
                  ))
                ) : (
                  <div className="p-6 bg-white rounded-xl border border-slate-100 text-center text-slate-400 text-sm shadow-md">
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

            {/* Gamification Card - Tonal Gradient, PRIMARY_ACCENT focus */}
            <div style={{ background: `linear-gradient(to bottom right, ${PRIMARY_ACCENT}, #334155)` }} className="rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Trophy className="text-amber-300" size={24} fill="currentColor" />
                    <h4 className="font-black text-xl">Consistency King</h4>
                </div>
                <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                  You are in the top <span className="font-bold text-white">15%</span> of users this week! Log one more workout to unlock the "Weekend Warrior" badge.
                </p>
                
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-300">
                        <span>Level 5 Progress</span>
                        <span>85%</span>
                    </div>
                    {/* Progress bar uses light accent color */}
                    <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
                        <div className="bg-gradient-to-r from-slate-200 to-slate-400 w-[85%] h-full rounded-full shadow-lg"></div>
                    </div>
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-black/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProgressInput
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onSubmit={handleDataRefresh} 
        inputType={inputType}
      />
      
      <MealLoggerModal 
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        onLog={handleDataRefresh} 
        initialNutrition={nutritionData}
      />
      
      <TransformationGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        photos={photos}
      />

      <div className="mt-20">
        <UnifiedFooter />
      </div>
    </div>
  );
}