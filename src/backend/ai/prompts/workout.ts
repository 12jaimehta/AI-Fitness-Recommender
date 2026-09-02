import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutMetrics } from "../workout-metrics";
import { coerceProgramGoal, programGoalLabel, workoutPromptFocus } from "@/shared/lib/program-goals";

export function buildWorkoutPrompt(
  userData: WorkoutPlanFormData,
  metrics: WorkoutMetrics,
  logNotes?: string
) {
  const equipmentNotes =
    userData.availableEquipment === "none"
      ? "All exercises must be bodyweight only, or simple outdoor work if the goal needs running."
      : userData.availableEquipment === "basic"
        ? "Use dumbbells, resistance bands, and common home gym items mixed with bodyweight. For Hyrox/running, include outdoor or treadmill running if needed."
        : "Full gym: barbells, cables, machines, cardio, sleds if present, functional equipment.";

  const weekly = userData.planType === "weekly";
  const goal = coerceProgramGoal(userData.goal) || "general_fitness";
  const muscles = userData.targetMuscles || [];
  const dietNote =
    userData.pairedCalorieTarget
      ? `User already has a diet at about ${userData.pairedCalorieTarget} calories` +
        (userData.pairedProteinTarget ? ` and ${userData.pairedProteinTarget} g protein` : "") +
        `. Keep the training load honest for that fuel.`
      : "User does not have a paired diet yet. Training still comes first.";

  return `You are an expert coach. Generate a workout plan for this goal: ${programGoalLabel(goal)}.
---
Age: ${userData.age}
Gender: ${userData.gender}
Fitness Level: ${userData.fitnessLevel}
Goal: ${goal} (${programGoalLabel(goal)})
Workout Duration: ${userData.workoutDuration} minutes
Workout Frequency: ${userData.workoutFrequency} days per week
Available Equipment: ${userData.availableEquipment}
Preferred Workout Time: ${userData.preferredWorkoutTime || "not set"}
Injuries: ${userData.injuries || "None"}
Medical Conditions: ${userData.medicalConditions || "None"}
Plan Type: ${weekly ? "7-Day Weekly Plan" : "Single Day Plan"}
${dietNote}
---

Program style:
${workoutPromptFocus(goal, muscles)}

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

All work must fit ${userData.fitnessLevel} and ${userData.availableEquipment}.
${
  logNotes
    ? `
THIS WEEK'S SESSIONS (progress next week from these logs — same equipment, injuries, and goal; do not start from a blank form):
${logNotes}

If they skipped days, keep frequency honest. If they completed lifts, progress load or reps slightly. Keep rest days they actually need.
`
    : ""
}`;
}
