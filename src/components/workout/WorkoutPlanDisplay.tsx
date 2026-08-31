"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Printer,
  Dumbbell,
  Flame,
  Calendar,
  Activity,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Play
} from "lucide-react";

import { WorkoutPlanData } from "@/lib/service/dietWorkoutplan";
import PlanDisplayShell from "@/components/shared/PlanDisplayShell";
import PlanFormHeader from "@/components/shared/PlanFormHeader";
import PlanPairingCard from "@/components/shared/PlanPairingCard";
import { readGeneratedDietPlan } from "@frontend/features/diet-plan";
import { readGeneratedWorkoutPlan } from "@frontend/features/workout-plan";
import { hydratePlanCache } from "@frontend/features/plan-cache";
import PlanResultHeader from "@/components/shared/PlanResultHeader";
import PlanStatGrid from "@/components/shared/PlanStatGrid";
import PlanViewToggle from "@/components/shared/PlanViewToggle";
import PlanTips from "@/components/shared/PlanTips";
import { clampSize, isMobile } from "@/components/shared/planDisplayUtils";

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
  const [otherExists, setOtherExists] = useState(false);
  const [pairedGoal, setPairedGoal] = useState<string | undefined>();

  useEffect(() => {
    void hydratePlanCache().then(() => {
      setOtherExists(Boolean(readGeneratedDietPlan()));
      setPairedGoal(readGeneratedWorkoutPlan()?.formData?.goal);
    });
  }, []);

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
    <PlanDisplayShell>
      <PlanFormHeader
        currentLabel="Workout Plan"
        currentPlanHref="/diet"
        currentPlanText="Make a matching diet"
      />
      <PlanPairingCard
        context="workout-result"
        otherExists={otherExists}
        goal={pairedGoal}
      />
      <PlanResultHeader
        icon={Dumbbell}
        title="Your Personalized Workout Plan"
        subtitle="Tailored to your fitness level and goals"
        loading={loading}
        onRegenerate={onRegenerate}
        onNewPlan={onNewPlan}
        extraAction={{
          label: "Print Plan",
          icon: Printer,
          onClick: () => window.print(),
        }}
      />

      <PlanStatGrid title="Workout Overview" items={workoutStats} />

      <PlanViewToggle activeView={activeView} onViewChange={setActiveView} />

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

      <PlanTips
        title="Workout Tips & Recommendations"
        icon={Zap}
        tips={workoutPlan.workoutTips}
      />
    </PlanDisplayShell>
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

