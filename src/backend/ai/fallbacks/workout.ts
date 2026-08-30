/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";

export function generateFallbackWorkoutPlan(userData: WorkoutPlanFormData, estimatedCaloriesBurn: number, recommendedRestDays: string[]) {
  const exercises = {
    none: [
      {
        name: "Push-ups",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "8-12" : userData.fitnessLevel === "intermediate" ? "12-20" : "20-30",
        rest: "60 seconds",
        instructions: "Start in plank position, lower body until chest nearly touches floor, push back up",
        muscleGroup: "chest",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Knee push-ups", description: "Perform push-ups with knees on the ground for easier variation" }
        ]
      },
      {
        name: "Bodyweight squats",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "10-15" : userData.fitnessLevel === "intermediate" ? "15-25" : "25-40",
        rest: "60 seconds",
        instructions: "Stand with feet shoulder-width apart, lower hips back and down as if sitting in chair",
        muscleGroup: "legs",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Partial squats", description: "Only go halfway down if full range is difficult" }
        ]
      },
      {
        name: "Plank",
        sets: 3,
        reps: "30-60 seconds",
        rest: "60 seconds",
        instructions: "Hold push-up position with body straight, engage core muscles",
        muscleGroup: "core",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Knee plank", description: "Perform plank with knees on ground for easier variation" }
        ]
      }
    ],
    basic: [
      {
        name: "Dumbbell chest press",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "8-12" : userData.fitnessLevel === "intermediate" ? "10-15" : "12-20",
        weight: "moderate dumbbells",
        rest: "60 seconds",
        instructions: "Lie on back, press dumbbells up from chest to arms extended",
        muscleGroup: "chest",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Push-ups", description: "Use bodyweight if no dumbbells available" }
        ]
      },
      {
        name: "Goblet squats",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "10-15" : userData.fitnessLevel === "intermediate" ? "12-20" : "15-25",
        weight: "light dumbbell",
        rest: "60 seconds",
        instructions: "Hold dumbbell vertically at chest, perform squat with upright torso",
        muscleGroup: "legs",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Bodyweight squats", description: "Perform without weight for easier variation" }
        ]
      }
    ],
    full_gym: [
      {
        name: "Bench press",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "8-12" : userData.fitnessLevel === "intermediate" ? "10-15" : "12-20",
        weight: "moderate barbell",
        rest: "90 seconds",
        instructions: "Lie on bench, lower barbell to chest, press up to arms extended",
        muscleGroup: "chest",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Dumbbell press", description: "Use dumbbells if barbell not available" }
        ]
      },
      {
        name: "Barbell back squats",
        sets: 3,
        reps: userData.fitnessLevel === "beginner" ? "8-12" : userData.fitnessLevel === "intermediate" ? "10-15" : "12-20",
        weight: "light to moderate barbell",
        rest: "90 seconds",
        instructions: "Place barbell on upper back, perform deep squat with proper form",
        muscleGroup: "legs",
        difficulty: userData.fitnessLevel,
        alternatives: [
          { name: "Goblet squats", description: "Use dumbbell for easier variation" }
        ]
      }
    ]
  };

  const selectedExercises = exercises[userData.availableEquipment as keyof typeof exercises] || exercises.none;

  const workoutTips = [
    "Always warm up before exercising to prevent injury",
    "Focus on proper form over heavy weights",
    "Stay hydrated throughout your workout",
    "Listen to your body and rest when needed",
    "Progress gradually by increasing weight or reps",
    "Include both strength and cardiovascular exercises",
    "Allow adequate recovery time between workouts"
  ];

  const warmupRoutine = [
    {
      name: "Jumping jacks",
      sets: 1,
      reps: "30 seconds",
      rest: "30 seconds",
      instructions: "Jump while spreading legs and raising arms overhead",
      muscleGroup: "full body",
      difficulty: "beginner",
      alternatives: []
    },
    {
      name: "Arm circles",
      sets: 1,
      reps: "30 seconds",
      rest: "30 seconds",
      instructions: "Circle arms forward and backward to warm up shoulders",
      muscleGroup: "shoulders",
      difficulty: "beginner",
      alternatives: []
    }
  ];

  const cooldownRoutine = [
    {
      name: "Standing quad stretch",
      sets: 1,
      reps: "30 seconds per leg",
      rest: "30 seconds",
      instructions: "Stand and pull heel toward glute to stretch quadriceps",
      muscleGroup: "legs",
      difficulty: "beginner",
      alternatives: []
    },
    {
      name: "Chest stretch",
      sets: 1,
      reps: "30 seconds",
      rest: "30 seconds",
      instructions: "Clasp hands behind back and gently raise to stretch chest",
      muscleGroup: "chest",
      difficulty: "beginner",
      alternatives: []
    }
  ];

  if (userData.planType === "weekly") {
    const weeklyPlan: any = {};
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    
    days.forEach((day, index) => {
      if (recommendedRestDays.includes(day.charAt(0).toUpperCase() + day.slice(1))) {
        weeklyPlan[day] = {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          muscleGroups: ["rest"],
          exercises: [],
          duration: "Rest day",
          difficulty: "rest",
          estimatedCalories: "0 calories"
        };
      } else {
        const muscleGroups = userData.targetMuscles.slice(0, 2);
        weeklyPlan[day] = {
          day: day.charAt(0).toUpperCase() + day.slice(1),
          muscleGroups: muscleGroups,
          exercises: selectedExercises.map(ex => ({
            ...ex,
            muscleGroup: muscleGroups.includes(ex.muscleGroup) ? ex.muscleGroup : muscleGroups[0]
          })),
          duration: `${userData.workoutDuration} minutes`,
          difficulty: userData.fitnessLevel,
          estimatedCalories: `${estimatedCaloriesBurn} calories`
        };
      }
    });

    return {
      weeklyPlan,
      workoutTips,
      estimatedCaloriesBurn: `${estimatedCaloriesBurn} calories per session`,
      recommendedRestDays,
      warmupRoutine,
      cooldownRoutine
    };
  } else {
    return {
      singleWorkout: {
        day: "Workout",
        muscleGroups: userData.targetMuscles.slice(0, 2),
        exercises: selectedExercises.map(ex => ({
          ...ex,
          muscleGroup: userData.targetMuscles.includes(ex.muscleGroup) ? ex.muscleGroup : userData.targetMuscles[0]
        })),
        duration: `${userData.workoutDuration} minutes`,
        difficulty: userData.fitnessLevel,
        estimatedCalories: `${estimatedCaloriesBurn} calories`
      },
      workoutTips,
      estimatedCaloriesBurn: `${estimatedCaloriesBurn} calories per session`,
      recommendedRestDays,
      warmupRoutine,
      cooldownRoutine
    };
  }
}
