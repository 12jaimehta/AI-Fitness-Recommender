import { z } from "zod";

export const dietPlanSchema = z.object({
  weight: z.string().min(1, "Please enter your weight").refine((val) => {
    const weight = parseFloat(val);
    return !isNaN(weight) && weight > 0;
  }, "Please enter a valid weight greater than 0"),
  
  weightUnit: z.enum(["kg", "lbs"]).default("kg"),
  
  height: z.string().optional(),
  
  heightUnit: z.enum(["cm", "ftin"]).default("cm"),
  
  feet: z.string().optional(),
  inches: z.string().optional(),
  
  age: z.string().min(1, "Please enter your age").refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age > 0 && age <= 120;
  }, "Age must be between 1 and 120 years"),
  
  gender: z.enum(["male", "female"]).refine((val) => val !== undefined, "Please select your gender"),
  
  workoutFrequency: z.enum(["0", "1-2", "3-4", "5-6", "7"]).refine((val) => val !== undefined, "Please select your workout frequency"),
  
  dietaryPreference: z.enum(["vegetarian", "non-vegetarian", "eggetarian", "vegan", "pescatarian"]).refine((val) => val !== undefined, "Please select your dietary preference"),
  
  goal: z.enum(["weight_loss", "muscle_gain", "weight_maintenance", "endurance", "general_health"]).refine((val) => val !== undefined, "Please select your fitness goal"),
  
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]).refine((val) => val !== undefined, "Please select your activity level"),
  
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  favoriteFoods: z.string().optional(),
  
  planType: z.enum(["single", "weekly"]).default("single"),
  mealsPerDay: z.enum(["3", "4", "5", "6"]).default("4"),
}).refine((data) => {
  // Height validation based on unit
  if (data.heightUnit === "cm") {
    const height = parseFloat(data.height || "");
    return !isNaN(height) && height > 0;
  } else if (data.heightUnit === "ftin") {
    const feet = parseInt(data.feet || "");
    const inches = parseInt(data.inches || "");
    return !isNaN(feet) && feet > 0 && !isNaN(inches) && inches >= 0 && inches < 12;
  }
  return false;
}, {
  message: "Please enter valid height measurements",
  path: ["height"],
}).refine((data) => {
  // Specific validation for feet and inches
  if (data.heightUnit === "ftin") {
    const feet = parseInt(data.feet || "");
    const inches = parseInt(data.inches || "");
    if (isNaN(feet) || feet <= 0) {
      return false;
    }
    if (isNaN(inches) || inches < 0 || inches >= 12) {
      return false;
    }
    return true;
  }
  return true;
}, {
  message: "Feet must be greater than 0 and inches must be between 0-11",
  path: ["feet"],
});

export type DietPlanFormData = z.infer<typeof dietPlanSchema>;

