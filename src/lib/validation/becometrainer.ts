import { z } from "zod";

export const trainerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  experience_years: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),

  hourly_rate: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : null)),

  expertise: z.array(z.string()).min(1, "At least one tag required"),
  avatar_url: z.string().nullable(),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;
