import { z } from "zod";
import { PROGRAM_GOALS, coerceProgramGoal } from "@/shared/lib/program-goals";

const programGoalSchema = z.preprocess(
  (value) => coerceProgramGoal(value) ?? value,
  z.enum(PROGRAM_GOALS, { message: "Please select your goal" })
);

function requiredNumber(
  emptyMessage: string,
  invalidMessage: string,
  isValid: (value: number) => boolean
) {
  return z.string().superRefine((val, ctx) => {
    if (!String(val).trim()) {
      ctx.addIssue({ code: "custom", message: emptyMessage });
      return;
    }
    const parsed = Number(val);
    if (!Number.isFinite(parsed) || !isValid(parsed)) {
      ctx.addIssue({ code: "custom", message: invalidMessage });
    }
  });
}

const heightFields = z.discriminatedUnion("heightUnit", [
  z.object({
    heightUnit: z.literal("cm"),
    height: requiredNumber(
      "Please enter your height",
      "Please enter a valid height greater than 0",
      (value) => value > 0 && value <= 300
    ),
    feet: z.string().optional(),
    inches: z.string().optional(),
  }),
  z.object({
    heightUnit: z.literal("ftin"),
    height: z.string().optional(),
    feet: requiredNumber(
      "Please enter your height in feet",
      "Feet must be between 1 and 8",
      (value) => Number.isInteger(value) && value >= 1 && value <= 8
    ),
    inches: z.string().superRefine((val, ctx) => {
      if (!String(val).trim()) {
        ctx.addIssue({ code: "custom", message: "Please enter inches (0–11)" });
        return;
      }
      const parsed = Number(val);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 11) {
        ctx.addIssue({ code: "custom", message: "Inches must be between 0 and 11" });
      }
    }),
  }),
]);

const dietDetailsSchema = z.object({
  weight: requiredNumber(
    "Please enter your weight",
    "Please enter a valid weight greater than 0",
    (value) => value > 0 && value <= 500
  ),

  weightUnit: z.enum(["kg", "lbs"]).default("kg"),

  age: requiredNumber(
    "Please enter your age",
    "Age must be between 1 and 120 years",
    (value) => Number.isInteger(value) && value >= 1 && value <= 120
  ),

  gender: z.enum(["male", "female"], { message: "Please select your gender" }),

  workoutFrequency: z.enum(["0", "1-2", "3-4", "5-6", "7"], {
    message: "Please select your workout frequency",
  }),

  dietaryPreference: z.enum(
    ["vegetarian", "non-vegetarian", "eggetarian", "vegan", "pescatarian"],
    { message: "Please select your dietary preference" }
  ),

  goal: programGoalSchema,

  activityLevel: z.enum(
    ["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"],
    { message: "Please select your activity level" }
  ),

  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  favoriteFoods: z.string().optional(),

  planType: z.enum(["single", "weekly"]).default("single"),
  mealsPerDay: z.enum(["3", "4", "5", "6"], { message: "Please select meals per day" }).default("4"),

  pairedTrainingDays: z.string().optional(),
  pairedTrainingDuration: z.string().optional(),
});

export const dietPlanSchema = dietDetailsSchema.and(heightFields);

export type DietPlanFormData = z.infer<typeof dietPlanSchema>;
