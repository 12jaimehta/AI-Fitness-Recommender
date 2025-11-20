"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Calendar, 
  Weight, 
  Target, 
  Award, 
  Activity,
  ChevronRight,
  Plus,
  Clock,
  Flame,
  Heart,
  User
} from "lucide-react";
import ProgressInput from "@/components/progress/ProgressInput";
import UserProfileSetup from "@/components/progress/user-profile";
import { databaseService } from "@/lib/service/database";
import { useUser } from "@/lib/hooks/use-user";
import { UnifiedFooter, UnifiedNavbar } from "@/components";

export default function ProgressPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoading: userLoading } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [inputType, setInputType] = useState<'weight' | 'workout' | 'goal'>('weight');
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  // Load user data
  useEffect(() => {
    if (user && isSignedIn) {
      loadUserData();
    }
  }, [user, isSignedIn]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if user has profile
      const profile = await databaseService.getUserProfile(user.id);
      
      if (!profile) {
        setShowProfileSetup(true);
        return;
      }

      setUserProfile(profile);

      // Load all data in parallel
      const [weightEntries, workoutEntries, userGoals, userAchievements, userStats] = await Promise.all([
        databaseService.getWeightEntries(user.id),
        databaseService.getWorkoutEntries(user.id),
        databaseService.getGoals(user.id),
        databaseService.getAchievements(user.id),
        databaseService.getUserStats(user.id)
      ]);

      setWeightData(weightEntries);
      setWorkoutData(workoutEntries);
      setGoals(userGoals);
      setAchievements(userAchievements);

      // Update stats
      setStats([
        { label: 'Total Workouts', value: userStats.totalWorkouts.toString(), icon: Activity, color: '#10b981' },
        { label: 'Calories Burned', value: userStats.totalCalories.toLocaleString(), icon: Flame, color: '#f59e0b' },
        { label: 'Weight Lost', value: `${userStats.weightLost} kg`, icon: TrendingUp, color: '#ef4444' },
        { label: 'Active Days', value: userStats.activeDays.toString(), icon: Calendar, color: '#3b82f6' }
      ]);

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = async (data: any) => {
    if (!user) return;

    try {
      if (data.type === 'weight') {
        const newEntry = await databaseService.addWeightEntry({
          user_id: user.id,
          weight: parseFloat(data.weight),
          date: data.date,
          notes: data.notes || null
        });

        if (newEntry) {
          setWeightData(prev => [newEntry, ...prev]);
          await loadUserData(); // Refresh stats
        }
      }

      if (data.type === 'workout') {
        const newEntry = await databaseService.addWorkoutEntry({
          user_id: user.id,
          workout_type: data.workoutType,
          duration_minutes: parseInt(data.duration),
          calories_burned: parseInt(data.calories),
          date: new Date().toISOString().split('T')[0],
          notes: data.notes || null
        });

        if (newEntry) {
          setWorkoutData(prev => [newEntry, ...prev]);
          await loadUserData(); // Refresh stats
        }
      }

      if (data.type === 'goal') {
        const newGoal = await databaseService.addGoal({
          user_id: user.id,
          title: data.goalTitle,
          category: data.goalCategory,
          target_value: parseFloat(data.goalTarget),
          current_value: 0,
          unit: data.goalUnit,
          deadline: null,
          is_completed: false
        });

        if (newGoal) {
          setGoals(prev => [newGoal, ...prev]);
        }
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const openInput = (type: 'weight' | 'workout' | 'goal') => {
    setInputType(type);
    setIsInputOpen(true);
  };

  // Format weight data for chart
  const chartWeightData = weightData.slice(0, 7).reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en', { weekday: 'short' }),
    weight: entry.weight
  }));

  // Show loading state
  if (userLoading || loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #162a41',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading your progress...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Show profile setup if needed
  if (showProfileSetup && user) {
    return <UserProfileSetup user={user} onComplete={() => {
      setShowProfileSetup(false);
      loadUserData();
    }} />;
  }

  // Redirect if not signed in
  if (!isSignedIn && !userLoading) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #162a41 0%, #1e3a5f 100%)',
        padding: '80px 0 60px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          position: 'relative',
          zIndex: 1
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div>
              <h1 style={{
                fontSize: '48px',
                fontWeight: '800',
                color: '#ffffff',
                margin: '0 0 16px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Track Your Progress
              </h1>
              <p style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: 0,
                maxWidth: '600px'
              }}>
                {userProfile?.full_name ? `Welcome back, ${userProfile.full_name}!` : 'Monitor your fitness journey and celebrate achievements.'}
              </p>
            </div>
            
            {userProfile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '16px 24px',
                borderRadius: '16px',
                backdropFilter: 'blur(10px)'
              }}>
                <User size={24} color="#ffffff" />
                <div>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    margin: '0 0 4px'
                  }}>
                    Current Weight
                  </p>
                  <p style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#ffffff',
                    margin: 0
                  }}>
                    {weightData[0]?.weight || userProfile.initial_weight} kg
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Rest of your ProgressPage component remains similar but uses real data */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  background: '#ffffff',
                  borderRadius: '18px',
                  padding: '20px',
                  boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    background: `${stat.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px', fontWeight: 500 }}>{stat.label}</p>
                  <p style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>{stat.value}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Weight + workouts */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)',
            gap: '28px',
            marginBottom: '40px',
          }}
        >
          {/* Weight history */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '20px',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Weight size={20} color="#162a41" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Weight trend</h3>
              </div>
              <button
                onClick={() => openInput('weight')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: '#ffffff',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Log weight
              </button>
            </div>

            <div
              style={{
                height: '200px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                marginBottom: '10px',
              }}
            >
              {chartWeightData.map((point, idx) => (
                <motion.div
                  key={`${point.date}-${idx}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(12, Number(point.weight) * 2)}px` }}
                  transition={{ duration: 0.4, delay: 0.05 * idx }}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to top, #162a41, #3b82f6)',
                    borderRadius: '8px 8px 0 0',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-18px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#111827',
                    }}
                  >
                    {point.weight}kg
                  </span>
                </motion.div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#6b7280',
              }}
            >
              {chartWeightData.map((point, idx) => (
                <span key={`label-${point.date}-${idx}`} style={{ flex: 1, textAlign: 'center' }}>
                  {point.date}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Recent workouts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              background: '#ffffff',
              borderRadius: '18px',
              padding: '20px',
              boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
              border: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="#162a41" />
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Recent workouts</h3>
              </div>
              <button
                onClick={() => openInput('workout')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  border: '1px solid rgba(15,23,42,0.12)',
                  background: '#ffffff',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add workout
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {workoutData.slice(0, 7).map((w) => (
                <div
                  key={w.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.18)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '0 0 4px' }}>{w.workout_type}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {new Date(w.date).toLocaleDateString('en', { weekday: 'short' })} · {w.duration_minutes} min · {w.calories_burned} cal
                    </p>
                  </div>
                  <ChevronRight size={18} color="#10b981" />
                </div>
              ))}
              {workoutData.length === 0 && (
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No workouts logged yet.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Goals & achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Target size={20} color="#162a41" />
              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Your goals</h3>
            </div>
            <button
              onClick={() => openInput('goal')}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                border: '1px solid rgba(15,23,42,0.12)',
                background: '#ffffff',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Set goal
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '18px',
            }}
          >
            {goals.map((goal) => {
              const progress = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0;
              return (
                <div
                  key={goal.id}
                  style={{
                    padding: '18px',
                    borderRadius: '14px',
                    border: '1px solid rgba(15, 23, 42, 0.08)',
                    background: 'rgba(15, 23, 42, 0.01)',
                  }}
                >
                  <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{goal.title}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </p>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: '999px',
                      background: 'rgba(209,213,219,0.7)',
                      overflow: 'hidden',
                      marginBottom: '6px',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.5 }}
                      style={{
                        height: '100%',
                        borderRadius: '999px',
                        background: progress >= 100 ? '#10b981' : '#3b82f6',
                      }}
                    />
                  </div>
                  <p
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: progress >= 100 ? '#10b981' : '#4b5563',
                      margin: 0,
                    }}
                  >
                    {progress >= 100 ? 'Goal achieved 🎉' : `${Math.round(progress)}% complete`}
                  </p>
                </div>
              );
            })}
            {goals.length === 0 && (
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No goals yet. Create one to track your progress.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
            border: '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={20} color="#162a41" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Recent achievements</h3>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '18px',
            }}
          >
            {achievements.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid rgba(15, 23, 42, 0.08)',
                  background: 'rgba(15, 23, 42, 0.01)',
                }}
              >
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{a.title}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 6px' }}>{a.description}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                  {new Date(a.achieved_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {achievements.length === 0 && (
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>No achievements recorded yet. Keep going!</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Progress Input Modal */}
      <ProgressInput
        isOpen={isInputOpen}
        onClose={() => setIsInputOpen(false)}
        onSubmit={handleInputSubmit}
        inputType={inputType}
      />
      <UnifiedFooter/>
    </div>
  );
}