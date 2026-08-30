import { z } from "zod";

export const profileSetupSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  age: z.coerce.number().min(13, "Age must be at least 13").max(100, "Enter a valid age"),
  gender: z.string().min(1, "Select a gender"),
  height: z.coerce.number().min(100, "Height is required").max(250, "Enter height in cm"),
  initial_weight: z.coerce.number().min(30, "Weight is required").max(400, "Enter weight in kg"),
  fitness_level: z.string().min(1, "Select a fitness level"),
  goals: z.array(z.string()).min(1, "Pick at least one goal"),
});

export type ProfileSetupData = z.infer<typeof profileSetupSchema>;
