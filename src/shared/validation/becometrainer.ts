import { z } from "zod";
import { normalizeInstagramHandle } from "@/shared/lib/instagram";

const optionalNumber = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  });

export const trainerSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  experience_years: optionalNumber,
  hourly_rate: optionalNumber,
  expertise: z.array(z.string()).min(1, "At least one tag required"),
  avatar_url: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => value || null),
  instagram_handle: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => normalizeInstagramHandle(value)),
});

export type TrainerFormData = z.infer<typeof trainerSchema>;
