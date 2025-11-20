import { WorkoutPlanFormData, workoutPlanSchema } from "@/lib/validation/workoutPlanSchema";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    // Ensure JSON content-type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type. Use application/json." },
        { status: 415 }
      );
    }

    const body = (await request.json()) as unknown;

    // Some clients may accidentally wrap payloads in markdown fences; attempt to recover
    // by stripping leading/trailing fences if the body was sent as a string.
    // This is defensive and won't run for proper JSON payloads.
    let requestData: unknown = body;
    if (typeof body === "string") {
      const cleaned = body
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      try {
        requestData = JSON.parse(cleaned);
      } catch {
        // Fall back to the original body (will fail validation below)
        requestData = body;
      }
    }

    // Validate input
    const result = workoutPlanSchema.safeParse(requestData);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userData = result.data as WorkoutPlanFormData;

    // Calculate workout parameters
    const age = parseInt(userData.age);
    const fitnessLevel = userData.fitnessLevel;
    const goal = userData.goal;
    const workoutDuration = parseInt(userData.workoutDuration);
    const workoutFrequency = parseInt(userData.workoutFrequency);
    const equipment = userData.availableEquipment;

    // Estimate calories burned per session based on intensity and duration
    const baseCaloriesPerMinute = {
      beginner: 5,
      intermediate: 8,
      advanced: 12
    };

    const goalMultipliers = {
      fat_loss: 1.2,
      muscle_gain: 0.9,
      strength: 0.8,
      endurance: 1.3,
      general_fitness: 1.0,
      athletic_performance: 1.4
    };

    const caloriesPerMinute = baseCaloriesPerMinute[fitnessLevel] * goalMultipliers[goal];
    const estimatedCaloriesBurn = Math.round(caloriesPerMinute * workoutDuration);

    // Determine recommended rest days
    const restDays = {
      2: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      3: ["Sunday", "Tuesday", "Thursday", "Saturday"],
      4: ["Sunday", "Wednesday", "Saturday"],
      5: ["Sunday", "Friday"],
      6: ["Sunday"]
    };

    const recommendedRestDays = restDays[workoutFrequency as keyof typeof restDays] || ["Sunday"];

    const prompt = `
You are an expert fitness trainer. Based on the following user data, generate a complete workout plan:
---
Age: ${userData.age}
Gender: ${userData.gender}
Fitness Level: ${userData.fitnessLevel}
Goal: ${userData.goal}
Workout Duration: ${userData.workoutDuration} minutes per session
Workout Frequency: ${userData.workoutFrequency} days per week
Available Equipment: ${userData.availableEquipment}
Preferred Workout Time: ${userData.preferredWorkoutTime}
Target Muscles: ${userData.targetMuscles.join(', ')}
Injuries: ${userData.injuries || "None"}
Medical Conditions: ${userData.medicalConditions || "None"}
Plan Type: ${userData.planType === "weekly" ? "7-Day Weekly Plan" : "Single Day Plan"}
---

Generate a personalized workout plan with the following structure:
${userData.planType === "weekly" ? `
Create a 7-day weekly plan with different workouts for each day to ensure variety and prevent overtraining.
Include ${recommendedRestDays.length} rest days: ${recommendedRestDays.join(', ')}.
Each workout should be approximately ${userData.workoutDuration} minutes.
` : `
Create a single day workout plan that is approximately ${userData.workoutDuration} minutes.
`}

Equipment considerations:
${equipment === "none" ? `
All exercises must be bodyweight only. No equipment required.
Focus on exercises like push-ups, squats, lunges, planks, burpees, mountain climbers, etc.
` : equipment === "basic" ? `
Include basic equipment exercises with dumbbells, resistance bands, and common home gym items.
Mix bodyweight exercises with basic equipment movements.
` : `
Full gym access available. Include a variety of equipment-based exercises:
- Barbells and dumbbells
- Cable machines
- Cardio equipment (treadmill, bike, rower)
- Resistance machines
- Functional training equipment
`}

Target muscle groups: ${userData.targetMuscles.join(', ')}
${userData.injuries ? `IMPORTANT: Avoid exercises that could aggravate these injuries: ${userData.injuries}` : ''}
${userData.medicalConditions ? `IMPORTANT: Consider these medical conditions: ${userData.medicalConditions}` : ''}

For each workout day, create exercises with:
- Specific sets, reps, and rest periods
- Clear instructions for proper form
- Difficulty level (beginner/intermediate/advanced)
- Alternative exercises for equipment limitations

${userData.planType === "weekly" ? `
Provide the response in **strict JSON** matching this schema:
{
  "weeklyPlan": {
    "monday": {
      "day": "Monday",
      "muscleGroups": ["chest", "triceps", "shoulders"],
      "exercises": [
        {
          "name": "Exercise name with specific details",
          "sets": 3,
          "reps": "12-15",
          "weight": "moderate weight",
          "rest": "60 seconds",
          "instructions": "Detailed step-by-step instructions for proper form",
          "muscleGroup": "primary muscle group",
          "difficulty": "intermediate",
          "alternatives": [
            { "name": "Alternative exercise", "description": "When to use this alternative" }
          ]
        }
      ],
      "duration": "45 minutes",
      "difficulty": "intermediate",
      "estimatedCalories": "300-400 calories"
    },
    "tuesday": { ... similar structure ... },
    "wednesday": { ... similar structure ... },
    "thursday": { ... similar structure ... },
    "friday": { ... similar structure ... },
    "saturday": { ... similar structure ... },
    "sunday": { ... similar structure ... }
  },
  "workoutTips": ["Tip 1", "Tip 2", "Tip 3"],
  "estimatedCaloriesBurn": "${estimatedCaloriesBurn} calories per session",
  "recommendedRestDays": ["${recommendedRestDays.join('", "')}"],
  "warmupRoutine": [
    {
      "name": "Warm-up exercise",
      "sets": 1,
      "reps": "30 seconds",
      "rest": "30 seconds",
      "instructions": "How to perform",
      "muscleGroup": "full body",
      "difficulty": "beginner",
      "alternatives": []
    }
  ],
  "cooldownRoutine": [
    {
      "name": "Cool-down stretch",
      "sets": 1,
      "reps": "30 seconds",
      "rest": "30 seconds",
      "instructions": "How to perform",
      "muscleGroup": "full body",
      "difficulty": "beginner",
      "alternatives": []
    }
  ]
}
` : `
Provide the response in **strict JSON** matching this schema:
{
  "singleWorkout": {
    "day": "Workout",
    "muscleGroups": ["chest", "triceps", "shoulders"],
    "exercises": [
      {
        "name": "Exercise name with specific details",
        "sets": 3,
        "reps": "12-15",
        "weight": "moderate weight",
        "rest": "60 seconds",
        "instructions": "Detailed step-by-step instructions for proper form",
        "muscleGroup": "primary muscle group",
        "difficulty": "intermediate",
        "alternatives": [
          { "name": "Alternative exercise", "description": "When to use this alternative" }
        ]
      }
    ],
    "duration": "${userData.workoutDuration} minutes",
    "difficulty": "${fitnessLevel}",
    "estimatedCalories": "${estimatedCaloriesBurn} calories"
  },
  "workoutTips": ["Tip 1", "Tip 2", "Tip 3"],
  "estimatedCaloriesBurn": "${estimatedCaloriesBurn} calories per session",
  "recommendedRestDays": ["${recommendedRestDays.join('", "')}"],
  "warmupRoutine": [
    {
      "name": "Warm-up exercise",
      "sets": 1,
      "reps": "30 seconds",
      "rest": "30 seconds",
      "instructions": "How to perform",
      "muscleGroup": "full body",
      "difficulty": "beginner",
      "alternatives": []
    }
  ],
  "cooldownRoutine": [
    {
      "name": "Cool-down stretch",
      "sets": 1,
      "reps": "30 seconds",
      "rest": "30 seconds",
      "instructions": "How to perform",
      "muscleGroup": "full body",
      "difficulty": "beginner",
      "alternatives": []
    }
  ]
}`}

CRITICAL: Make sure all exercises are appropriate for ${userData.fitnessLevel} fitness level and ${userData.availableEquipment} equipment availability.
${userData.injuries ? `CRITICAL: Avoid exercises that could aggravate: ${userData.injuries}` : ''}
${userData.medicalConditions ? `CRITICAL: Consider medical conditions: ${userData.medicalConditions}` : ''}
CRITICAL: Focus on target muscle groups: ${userData.targetMuscles.join(', ')}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    const jsonText = response.choices[0].message?.content || "{}";
    
    // Clean up the response - remove any markdown code blocks
    const cleanedJson = jsonText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    
    let workoutPlan: any;
    try {
      workoutPlan = JSON.parse(cleanedJson);
      console.log("AI Response parsed successfully:", {
        hasSingleWorkout: !!workoutPlan.singleWorkout,
        hasWeeklyPlan: !!workoutPlan.weeklyPlan,
        hasWorkoutTips: !!workoutPlan.workoutTips,
        responseKeys: Object.keys(workoutPlan)
      });
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanedJson);
      console.error("Parse error details:", parseError);
      // Fallback to a basic workout plan if AI fails
      workoutPlan = generateFallbackWorkoutPlan(userData, estimatedCaloriesBurn, recommendedRestDays);
      console.log("Using fallback workout plan due to parse error");
    }

    // Validate response structure
    const isValidSingleDay = workoutPlan.singleWorkout && workoutPlan.workoutTips;
    const isValidWeekly = workoutPlan.weeklyPlan && workoutPlan.workoutTips;
    
    if (!isValidSingleDay && !isValidWeekly) {
      console.error("Invalid AI response structure:", {
        hasSingleWorkout: !!workoutPlan.singleWorkout,
        hasWeeklyPlan: !!workoutPlan.weeklyPlan,
        hasWorkoutTips: !!workoutPlan.workoutTips,
        responseKeys: Object.keys(workoutPlan)
      });
      console.log("Using fallback workout plan due to invalid structure");
      workoutPlan = generateFallbackWorkoutPlan(userData, estimatedCaloriesBurn, recommendedRestDays);
    }

    return NextResponse.json(workoutPlan, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate workout plan";
    
    console.error("AI generation error:", err);
    
    // If upstream sent a markdown-encoded payload that led to a parse error,
    // surface a clearer message.
    const isFenceError =
      typeof message === "string" &&
      message.toLowerCase().includes("unexpected token '`'");

    return NextResponse.json(
      {
        error: isFenceError
          ? "Invalid JSON payload. Remove markdown code fences (``` ... ```)."
          : "Failed to generate workout plan",
        details: message,
      },
      { status: 500 }
    );
  }
}

// Fallback workout plan generator in case AI fails
function generateFallbackWorkoutPlan(userData: WorkoutPlanFormData, estimatedCaloriesBurn: number, recommendedRestDays: string[]) {
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
