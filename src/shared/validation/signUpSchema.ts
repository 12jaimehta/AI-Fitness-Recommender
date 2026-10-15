import { z } from "zod";
import { disposableEmailMessage, isDisposableEmail, normalizeEmail } from "@/shared/lib/disposable-emails";

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .regex(/[A-Z]/, { message: "Password must contain an uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain a lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain a number" })
  .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain a special character" });

export const accountEmailSchema = z
  .string()
  .email({ message: "Please enter a valid email" })
  .transform((value) => normalizeEmail(value))
  .refine((value) => !isDisposableEmail(value), { message: disposableEmailMessage() });

export const signUpSchema = z
  .object({
    fullName: z.string().min(2, { message: "Full name is required" }),
    email: accountEmailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyOtpSchema = z.object({
  email: accountEmailSchema,
  token: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: "Enter the 6-digit code from your email" }),
  purpose: z.enum(["signup", "recovery"]).optional(),
});

export const resendOtpSchema = z.object({
  email: accountEmailSchema,
  purpose: z.enum(["signup", "recovery"]).optional(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignUpForm = z.infer<typeof signUpSchema>;
export type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
