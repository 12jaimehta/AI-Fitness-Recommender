import { z } from "zod";

// Workout Plan Validation Schema
export const workoutPlanSchema = z.object({
  age: z.string().min(1, "Please enter your age").refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age > 0 && age <= 120;
  }, "Age must be between 1 and 120 years"),
  
  gender: z.enum(["male", "female"]).refine((val) => val !== undefined, "Please select your gender"),
  
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).refine((val) => val !== undefined, "Please select your fitness level"),
  
  goal: z.enum(["muscle_gain", "fat_loss", "strength", "endurance", "general_fitness", "athletic_performance"]).refine((val) => val !== undefined, "Please select your fitness goal"),
  
  workoutDuration: z.enum(["30", "45", "60", "90"]).refine((val) => val !== undefined, "Please select workout duration"),
  
  workoutFrequency: z.enum(["2", "3", "4", "5", "6"]).refine((val) => val !== undefined, "Please select workout frequency"),
  
  availableEquipment: z.enum(["none", "basic", "full_gym"]).refine((val) => val !== undefined, "Please select available equipment"),
  
  preferredWorkoutTime: z.enum(["morning", "afternoon", "evening"]).refine((val) => val !== undefined, "Please select preferred workout time"),
  
  targetMuscles: z.array(z.string()).min(1, "Please select at least one target muscle group"),
  
  injuries: z.string().optional(),
  medicalConditions: z.string().optional(),
  
  planType: z.enum(["single", "weekly"]),
});

export type WorkoutPlanFormData = z.infer<typeof workoutPlanSchema>;
