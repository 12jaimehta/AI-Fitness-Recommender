import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutMetrics } from "../workout-metrics";

export function buildWorkoutPrompt(userData: WorkoutPlanFormData, metrics: WorkoutMetrics) {
  const equipmentNotes =
    userData.availableEquipment === "none"
      ? "All exercises must be bodyweight only."
      : userData.availableEquipment === "basic"
        ? "Use dumbbells, resistance bands, and common home gym items mixed with bodyweight."
        : "Full gym: barbells, cables, machines, cardio, functional equipment.";

  const weekly = userData.planType === "weekly";

  return `You are an expert fitness trainer. Generate a complete workout plan.
---
Age: ${userData.age}
Gender: ${userData.gender}
Fitness Level: ${userData.fitnessLevel}
Goal: ${userData.goal}
Workout Duration: ${userData.workoutDuration} minutes
Workout Frequency: ${userData.workoutFrequency} days per week
Available Equipment: ${userData.availableEquipment}
Preferred Workout Time: ${userData.preferredWorkoutTime}
Target Muscles: ${userData.targetMuscles.join(", ")}
Injuries: ${userData.injuries || "None"}
Medical Conditions: ${userData.medicalConditions || "None"}
Plan Type: ${weekly ? "7-Day Weekly Plan" : "Single Day Plan"}
---

${
  weekly
    ? `Create a 7-day weekly plan. Rest days: ${metrics.recommendedRestDays.join(", ")}. Each workout ~${userData.workoutDuration} minutes.`
    : `Create a single day workout ~${userData.workoutDuration} minutes.`
}

Equipment: ${equipmentNotes}
${userData.injuries ? `IMPORTANT: Avoid aggravating: ${userData.injuries}` : ""}
${userData.medicalConditions ? `IMPORTANT: Consider: ${userData.medicalConditions}` : ""}

Each exercise needs sets, reps, rest, form instructions, difficulty, muscleGroup, and alternatives.

${
  weekly
    ? `JSON schema:
{
  "weeklyPlan": {
    "monday": { "day": "Monday", "muscleGroups": [string], "exercises": [{ "name": string, "sets": number, "reps": string, "weight": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": string, "alternatives": [{ "name": string, "description": string }] }], "duration": string, "difficulty": string, "estimatedCalories": string },
    "tuesday": {}, "wednesday": {}, "thursday": {}, "friday": {}, "saturday": {}, "sunday": {}
  },
  "workoutTips": [string],
  "estimatedCaloriesBurn": "${metrics.estimatedCaloriesBurn} calories per session",
  "recommendedRestDays": ${JSON.stringify(metrics.recommendedRestDays)},
  "warmupRoutine": [{ "name": string, "sets": 1, "reps": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": "beginner", "alternatives": [] }],
  "cooldownRoutine": [{ "name": string, "sets": 1, "reps": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": "beginner", "alternatives": [] }]
}`
    : `JSON schema:
{
  "singleWorkout": {
    "day": "Workout",
    "muscleGroups": [string],
    "exercises": [{ "name": string, "sets": number, "reps": string, "weight": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": string, "alternatives": [{ "name": string, "description": string }] }],
    "duration": "${userData.workoutDuration} minutes",
    "difficulty": "${userData.fitnessLevel}",
    "estimatedCalories": "${metrics.estimatedCaloriesBurn} calories"
  },
  "workoutTips": [string],
  "estimatedCaloriesBurn": "${metrics.estimatedCaloriesBurn} calories per session",
  "recommendedRestDays": ${JSON.stringify(metrics.recommendedRestDays)},
  "warmupRoutine": [{ "name": string, "sets": 1, "reps": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": "beginner", "alternatives": [] }],
  "cooldownRoutine": [{ "name": string, "sets": 1, "reps": string, "rest": string, "instructions": string, "muscleGroup": string, "difficulty": "beginner", "alternatives": [] }]
}`
}

All exercises must fit ${userData.fitnessLevel} and ${userData.availableEquipment}. Focus on: ${userData.targetMuscles.join(", ")}.`;
}
