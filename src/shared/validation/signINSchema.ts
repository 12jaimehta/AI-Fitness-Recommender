import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z.string().email("Valid email required"),
});
export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});
export type MagicLinkForm = z.infer<typeof magicLinkSchema>;
export type SignInForm = z.infer<typeof signInSchema>;
