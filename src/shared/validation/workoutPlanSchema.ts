import { z } from "zod";
import { PROGRAM_GOALS, coerceProgramGoal } from "@/shared/lib/program-goals";

const programGoalSchema = z.preprocess(
  (value) => coerceProgramGoal(value) ?? value,
  z.enum(PROGRAM_GOALS, { message: "Please select your goal" })
);

export const workoutPlanSchema = z.object({
  age: z.string().min(1, "Please enter your age").refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age > 0 && age <= 120;
  }, "Age must be between 1 and 120 years"),

  gender: z.enum(["male", "female"], { message: "Please select your gender" }),

  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Please select your fitness level",
  }),

  goal: programGoalSchema,

  workoutDuration: z.enum(["30", "45", "60", "90"], {
    message: "Please select workout duration",
  }),

  workoutFrequency: z.enum(["2", "3", "4", "5", "6"], {
    message: "Please select workout frequency",
  }),

  availableEquipment: z.enum(["none", "basic", "full_gym"], {
    message: "Please select available equipment",
  }),

  preferredWorkoutTime: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(["morning", "afternoon", "evening"]).optional()
  ),

  targetMuscles: z.array(z.string()).optional().default([]),

  injuries: z.string().optional(),
  medicalConditions: z.string().optional(),

  planType: z.enum(["single", "weekly"]),

  pairedCalorieTarget: z.string().optional(),
  pairedProteinTarget: z.string().optional(),
});

export type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;
