"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RefreshCw, 
  RotateCcw, 
  Printer,
  Dumbbell,
  Clock,
  Flame,
  Target,
  Activity,
  TrendingUp,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Zap,
  CheckCircle2,
  Play
} from "lucide-react";

import { WorkoutPlanData } from "@/lib/service/dietWorkoutplan";

interface WorkoutPlanDisplayProps {
  workoutPlan: WorkoutPlanData;
  onNewPlan: () => void;
  onRegenerate: () => void;
  loading?: boolean;
}

const muscleGroupEmojis = {
  chest: "💪",
  back: "🔙",
  shoulders: "🤸",
  biceps: "💪",
  triceps: "💪",
  legs: "🦵",
  glutes: "🍑",
  core: "🎯",
  abs: "🏋️",
  calves: "🦶",
  forearms: "💪",
  traps: "🤸"
};

const difficultyColors = {
  beginner: "#10b981",
  intermediate: "#f59e0b",
  advanced: "#ef4444"
};

export default function WorkoutPlanDisplay({ 
  workoutPlan, 
  onNewPlan, 
  onRegenerate, 
  loading = false 
}: WorkoutPlanDisplayProps) {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Record<string, boolean>>({});
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const [activeView, setActiveView] = useState<'single' | 'weekly'>('single');
  const [showAlternatives, setShowAlternatives] = useState<Record<string, boolean>>({});

  const toggleWorkoutExpansion = (dayKey: string) => {
    setExpandedWorkouts(prev => ({
      ...prev,
      [dayKey]: !prev[dayKey]
    }));
  };

  const toggleAlternatives = (exerciseId: string) => {
    setShowAlternatives(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const workoutStats = [
    { 
      label: "Workouts/Week", 
      value: workoutPlan.weeklyPlan ? Object.keys(workoutPlan.weeklyPlan).length : 1, 
      icon: Calendar 
    },
    { 
      label: "Est. Calories/Session", 
      value: workoutPlan.estimatedCaloriesBurn || "300-500", 
      icon: Flame 
    },
    { 
      label: "Rest Days", 
      value: workoutPlan.recommendedRestDays?.length || 2, 
      icon: Activity 
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Header onRegenerate={onRegenerate} onNewPlan={onNewPlan} loading={loading} />
        
        <WorkoutStats workoutStats={workoutStats} />
        
        {workoutPlan.weeklyPlan && (
          <ViewToggle activeView={activeView} onViewChange={setActiveView} />
        )}
        
        <WorkoutPlansSection 
          workoutPlan={workoutPlan}
          activeView={activeView}
          selectedDay={selectedDay}
          expandedWorkouts={expandedWorkouts}
          showAlternatives={showAlternatives}
          onDaySelect={setSelectedDay}
          onWorkoutToggle={toggleWorkoutExpansion}
          onAlternativesToggle={toggleAlternatives}
          days={days}
        />
        
        <WorkoutTips workoutTips={workoutPlan.workoutTips} />
      </div>
    </div>
  );
}

function Header({ onRegenerate, onNewPlan, loading }: { onRegenerate: () => void; onNewPlan: () => void; loading: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', marginBottom: '50px' }}
    >
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: '#282828',
        marginBottom: '20px'
      }}>
        <Dumbbell size={40} color="#ffffff" />
      </div>
      
      <h1 style={{
        fontSize: clampSize(32, 48),
        fontWeight: '800',
        color: '#282828',
        marginBottom: '15px'
      }}>
        Your Personalized Workout Plan
      </h1>
      <p style={{ color: '#6b7280', fontSize: clampSize(16, 18), marginBottom: '30px' }}>
        Tailored to your fitness level and goals
      </p>

      <ActionButtons onRegenerate={onRegenerate} onNewPlan={onNewPlan} loading={loading} />
    </motion.div>
  );
}

function ActionButtons({ onRegenerate, onNewPlan, loading }: { onRegenerate: () => void; onNewPlan: () => void; loading: boolean }) {
  return (
    <motion.div 
      style={{ 
        display: 'flex', 
        gap: '15px', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        flexDirection: isMobile() ? 'column' : 'row',
        alignItems: 'center'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <motion.button
        whileHover={!loading ? { 
          scale: 1.05,
          boxShadow: '0 15px 35px rgba(22, 42, 65, 0.3)'
        } : {}}
        whileTap={!loading ? { scale: 0.95 } : {}}
        onClick={onRegenerate}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#282828',
          color: '#ffffff',
          border: 'none',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 10 }}
      >
        <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        {loading ? "Generating..." : "Regenerate"}
      </motion.button>

      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 25px rgba(22, 42, 65, 0.2)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={onNewPlan}
        style={{
          background: '#ffffff',
          color: '#282828',
          border: '2px solid #282828',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 10 }}
      >
        <RotateCcw size={18} />
        New Plan
      </motion.button>

      <motion.button
        whileHover={{ 
          scale: 1.05,
          boxShadow: '0 8px 25px rgba(22, 42, 65, 0.2)'
        }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.print()}
        style={{
          background: '#ffffff',
          color: '#282828',
          border: '2px solid #282828',
          padding: '14px 28px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          minWidth: '140px',
          justifyContent: 'center'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 400, damping: 10 }}
      >
        <Printer size={18} />
        Print Plan
      </motion.button>
    </motion.div>
  );
}

function WorkoutStats({ workoutStats }: { workoutStats: any[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{ marginBottom: '50px' }}
    >
      <h2 style={{
        fontSize: clampSize(24, 28),
        fontWeight: '700',
        color: '#282828',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        Workout Overview
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile() ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px'
      }}>
        {workoutStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            style={{
              background: 'rgba(22, 42, 65, 0.05)',
              border: '2px solid rgba(22, 42, 65, 0.1)',
              borderRadius: '16px',
              padding: '24px',
              textAlign: 'center',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              scale: 1.05,
              borderColor: '#282828',
              boxShadow: '0 8px 25px rgba(22, 42, 65, 0.15)'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#282828',
              margin: '0 auto 15px'
            }}>
              <stat.icon size={24} color="#ffffff" />
            </div>
            <div style={{
              fontSize: clampSize(20, 24),
              fontWeight: '700',
              color: '#282828',
              marginBottom: '5px'
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ViewToggle({ activeView, onViewChange }: { activeView: 'single' | 'weekly'; onViewChange: (view: 'single' | 'weekly') => void }) {
  const tabs = [
    { id: 'single', label: 'Daily View', icon: Target },
    { id: 'weekly', label: 'Weekly View', icon: Calendar }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      style={{ marginBottom: '40px' }}
    >
      <div style={{
        display: 'flex',
        background: 'rgba(22, 42, 65, 0.05)',
        borderRadius: '12px',
        padding: '4px',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => onViewChange(tab.id as 'single' | 'weekly')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              background: activeView === tab.id ? '#282828' : 'transparent',
              color: activeView === tab.id ? '#ffffff' : '#282828',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <tab.icon size={16} />
            {tab.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function WorkoutPlansSection({ 
  workoutPlan, 
  activeView, 
  selectedDay, 
  expandedWorkouts, 
  showAlternatives,
  onDaySelect, 
  onWorkoutToggle, 
  onAlternativesToggle,
  days 
}: any) {
  const currentWorkout = workoutPlan.weeklyPlan?.[selectedDay] || workoutPlan.dailyWorkout;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      style={{ marginBottom: '50px' }}
    >
      <h2 style={{
        fontSize: clampSize(24, 28),
        fontWeight: '700',
        color: '#282828',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        Workout Routines
      </h2>

      {workoutPlan.weeklyPlan && activeView === 'weekly' && (
        <DaySelector 
          days={days} 
          selectedDay={selectedDay} 
          onDaySelect={onDaySelect} 
          workouts={workoutPlan.weeklyPlan}
        />
      )}

      <WorkoutCard 
        workout={currentWorkout}
        day={selectedDay}
        isExpanded={expandedWorkouts[selectedDay]}
        onToggle={() => onWorkoutToggle(selectedDay)}
        showAlternatives={showAlternatives}
        onAlternativesToggle={onAlternativesToggle}
      />
    </motion.div>
  );
}

function DaySelector({ days, selectedDay, onDaySelect, workouts }: any) {
  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '30px',
      overflowX: 'auto',
      padding: '5px'
    }}>
      {days.map((day: string) => {
        const hasWorkout = workouts && workouts[day];
        return (
          <motion.button
            key={day}
            onClick={() => onDaySelect(day)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '2px solid',
              borderColor: selectedDay === day ? '#282828' : hasWorkout ? 'rgba(22, 42, 65, 0.3)' : 'rgba(22, 42, 65, 0.1)',
              background: selectedDay === day ? '#282828' : hasWorkout ? 'rgba(22, 42, 65, 0.05)' : 'transparent',
              color: selectedDay === day ? '#ffffff' : '#282828',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              whiteSpace: 'nowrap',
              textTransform: 'capitalize',
              opacity: hasWorkout ? 1 : 0.5
            }}
            whileHover={{ scale: hasWorkout ? 1.05 : 1 }}
            whileTap={{ scale: hasWorkout ? 0.95 : 1 }}
          >
            {day.slice(0, 3)}
            {hasWorkout && <Zap size={12} style={{ marginLeft: '4px' }} />}
          </motion.button>
        );
      })}
    </div>
  );
}

function WorkoutCard({ workout, day, isExpanded, onToggle, showAlternatives, onAlternativesToggle }: any) {
  if (!workout) {
    return (
      <div style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        padding: '40px',
        textAlign: 'center'
      }}>
        <Activity size={48} color="#6b7280" style={{ margin: '0 auto 15px' }} />
        <h3 style={{
          color: '#6b7280',
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '10px'
        }}>
          Rest Day
        </h3>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          Time to recover and recharge
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
      whileHover={{ 
        borderColor: '#282828',
        boxShadow: '0 8px 25px rgba(22, 42, 65, 0.1)'
      }}
    >
      <div
        style={{
          padding: '20px',
          cursor: 'pointer',
          background: isExpanded ? 'rgba(22, 42, 65, 0.05)' : 'transparent'
        }}
        onClick={onToggle}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexDirection: isMobile() ? 'column' : 'row',
          gap: '15px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px',
            flex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: '#282828'
            }}>
              <Play size={24} color="#ffffff" />
            </div>
            <div>
              <h3 style={{
                color: '#282828',
                fontSize: clampSize(18, 20),
                fontWeight: '700',
                marginBottom: '5px',
                textTransform: 'capitalize'
              }}>
                {day} Workout
              </h3>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '500'
              }}>
                {workout.exercises?.length || 0} exercises • {workout.difficulty || 'intermediate'} difficulty
              </p>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '15px' 
          }}>
            <div style={{
              background: 'rgba(22, 42, 65, 0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              color: '#282828',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              {workout.exercises?.length || 0} exercises
            </div>
            {isExpanded ? 
              <ChevronUp size={20} color="#282828" /> : 
              <ChevronDown size={20} color="#282828" />
            }
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <WorkoutContent 
              workout={workout}
              showAlternatives={showAlternatives}
              onAlternativesToggle={onAlternativesToggle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WorkoutContent({ workout, showAlternatives, onAlternativesToggle }: any) {
  return (
    <div style={{ padding: '0 20px 20px' }}>
      <div style={{
        background: 'rgba(22, 42, 65, 0.03)',
        border: '1px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h4 style={{ 
          color: '#282828', 
          fontSize: '16px', 
          fontWeight: '600', 
          marginBottom: '15px' 
        }}>
          Workout Details
        </h4>
        <div style={{
          display: 'flex',
          gap: '15px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'rgba(22, 42, 65, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            color: '#282828',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {workout.difficulty || 'intermediate'}
          </div>
          <div style={{
            background: 'rgba(22, 42, 65, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            color: '#282828',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {workout.duration || '45-60 min'}
          </div>
          <div style={{
            background: 'rgba(22, 42, 65, 0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            color: '#282828',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {workout.targetMuscles?.join(', ') || 'Full body'}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '15px'
      }}>
        {workout.exercises?.map((exercise: any, index: number) => (
          <ExerciseCard
            key={index}
            exercise={exercise}
            index={index}
            showAlternatives={showAlternatives[`${exercise.name}-${index}`]}
            onToggleAlternatives={() => onAlternativesToggle(`${exercise.name}-${index}`)}
          />
        ))}
      </div>
    </div>
  );
}

function ExerciseCard({ exercise, index, showAlternatives, onToggleAlternatives }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        transition: 'all 0.3s ease'
      }}
      whileHover={{ 
        borderColor: '#282828',
        boxShadow: '0 8px 25px rgba(22, 42, 65, 0.1)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px'
      }}>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#282828',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {muscleGroupEmojis[exercise.muscleGroup as keyof typeof muscleGroupEmojis] || '💪'} {exercise.name}
          </h4>
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '8px'
          }}>
            <span style={{
              background: '#282828',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {exercise.sets} sets
            </span>
            <span style={{
              background: '#282828',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {exercise.reps} reps
            </span>
            <span style={{
              background: '#282828',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {exercise.weight || 'bodyweight'}
            </span>
          </div>
          {exercise.description && (
            <p style={{
              color: '#6b7280',
              fontSize: '13px',
              lineHeight: '1.5',
              margin: 0
            }}>
              {exercise.description}
            </p>
          )}
        </div>
      </div>

      {exercise.alternatives && exercise.alternatives.length > 0 && (
        <motion.button
          onClick={onToggleAlternatives}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(22, 42, 65, 0.05)',
            border: '1px solid rgba(22, 42, 65, 0.2)',
            padding: '8px 12px',
            borderRadius: '8px',
            color: '#282828',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ 
            background: 'rgba(22, 42, 65, 0.1)',
            borderColor: '#282828'
          }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertCircle size={14} />
          {showAlternatives ? 'Hide' : 'Show'} Alternatives ({exercise.alternatives.length})
        </motion.button>
      )}

      <AnimatePresence>
        {showAlternatives && exercise.alternatives && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ 
              overflow: 'hidden',
              marginTop: '15px'
            }}
          >
            <div style={{
              background: 'rgba(22, 42, 65, 0.03)',
              border: '1px solid rgba(22, 42, 65, 0.1)',
              borderRadius: '12px',
              padding: '15px'
            }}>
              <h5 style={{
                color: '#282828',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                Alternative Exercises
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {exercise.alternatives.map((alt: any, altIndex: number) => (
                  <div key={altIndex} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '8px',
                    border: '1px solid rgba(22, 42, 65, 0.1)'
                  }}>
                    <span style={{
                      color: '#374151',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {alt.name || alt}
                    </span>
                    {alt.difficulty && (
                      <span style={{
                        background: difficultyColors[alt.difficulty as keyof typeof difficultyColors] || '#6b7280',
                        color: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '600'
                      }}>
                        {alt.difficulty}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function WorkoutTips({ workoutTips }: { workoutTips: string[] }) {
  if (!workoutTips || workoutTips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8 }}
    >
      <div style={{
        background: 'rgba(22, 42, 65, 0.02)',
        border: '2px solid rgba(22, 42, 65, 0.1)',
        borderRadius: '16px',
        padding: '30px'
      }}>
        <h3 style={{
          fontSize: clampSize(20, 24),
          fontWeight: '700',
          color: '#282828',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Zap size={24} color="#282828" />
          Workout Tips & Recommendations
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile() ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '15px'
        }}>
          {workoutTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              style={{
                display: 'flex',
                gap: '10px',
                padding: '15px',
                background: 'rgba(22, 42, 65, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(22, 42, 65, 0.1)'
              }}
            >
              <CheckCircle2 size={18} color="#282828" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ 
                color: '#374151', 
                fontSize: '14px', 
                lineHeight: '1.6',
                fontWeight: '500'
              }}>
                {tip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Utility functions
function clampSize(min: number, max: number): string {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
  if (width < 768) return `${min}px`;
  if (width > 1200) return `${max}px`;
  return `${min + (max - min) * ((width - 768) / (1200 - 768))}px`;
}

function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 768;
}
