import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
});

export type SignInForm = z.infer<typeof signInSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
