import { z } from "zod";
import { accountEmailSchema } from "@/shared/validation/signUpSchema";

export const signInSchema = z.object({
  email: accountEmailSchema,
  password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: accountEmailSchema,
});

export type SignInForm = z.infer<typeof signInSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
