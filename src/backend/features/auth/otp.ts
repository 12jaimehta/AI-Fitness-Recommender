import type { EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServiceSupabase } from "@backend/shared/api/supabase-admin";
import { createServerSupabase } from "@backend/shared/api/supabase";
import { getServiceRoleKey, getSupabaseEnv } from "@backend/shared/config/env";
import { ApiError } from "@backend/shared/lib/errors";
import { sendEmail } from "@backend/features/send-email";
import { cacheGet, cacheSet } from "@backend/shared/lib/redis";
import { signUpSchema, verifyOtpSchema, resendOtpSchema } from "@/shared/validation/signUpSchema";
import { forgotPasswordSchema } from "@/shared/validation/signINSchema";
import { normalizeEmail } from "@/shared/lib/disposable-emails";
import { hitCooldown, hitLimit } from "./rate-limit";
import { otpEmailHtml } from "./otp-email";

const COOKIE = "fyte_verify";
const OTP_TTL = 60 * 60;
type OtpPurpose = "signup" | "recovery";
type StoredOtp = { purpose: OtpPurpose; type: EmailOtpType };

function requireAdmin() {
  const admin = createServiceSupabase();
  if (!admin) {
    throw new ApiError(
      "Email sign-up needs a server key. Continue with Google, or try again later.",
      503
    );
  }
  return admin;
}

function otpTypeKey(email: string) {
  return `fyte:otp-type:${email}`;
}

async function rememberOtpType(email: string, purpose: OtpPurpose, type: EmailOtpType) {
  await cacheSet(otpTypeKey(email), { purpose, type } satisfies StoredOtp, OTP_TTL);
}

async function readOtpType(email: string): Promise<StoredOtp | null> {
  return cacheGet<StoredOtp>(otpTypeKey(email));
}

async function setVerifyCookie(email: string, purpose: OtpPurpose) {
  const store = await cookies();
  store.set(COOKIE, JSON.stringify({ email, purpose }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTP_TTL,
  });
}

async function readVerifyCookie(): Promise<{ email: string; purpose: OtpPurpose } | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; purpose?: OtpPurpose };
    if (!parsed.email) return null;
    return { email: normalizeEmail(parsed.email), purpose: parsed.purpose === "recovery" ? "recovery" : "signup" };
  } catch {
    return null;
  }
}

function clientIp(request?: Request) {
  const forwarded = request?.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request?.headers.get("x-real-ip") || "unknown";
}

async function throttleSend(email: string, request?: Request) {
  await hitCooldown(`fyte:otp-cool:${email}`, 45);
  await hitLimit(`fyte:otp-hour:${email}`, 5, 60 * 60);
  await hitLimit(`fyte:otp-ip:${clientIp(request)}`, 20, 60 * 60);
}

async function sendOtp(email: string, code: string, purpose: OtpPurpose) {
  const result = await sendEmail({
    to: email,
    subject: purpose === "recovery" ? `${code} is your fyteAI reset code` : `${code} is your fyteAI code`,
    html: otpEmailHtml(code, purpose),
  });
  if ("simulated" in result && result.simulated) {
    console.log(`Auth OTP for ${email}: ${code}`);
  }
}

async function getAuthUserByEmail(email: string) {
  const key = getServiceRoleKey();
  const { url } = getSupabaseEnv();
  if (!key) return null;
  const response = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${key}`, apikey: key },
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as {
    users?: Array<{ id: string; email?: string | null; email_confirmed_at?: string | null }>;
  };
  const users = payload.users ?? [];
  return users.find((user) => normalizeEmail(user.email || "") === email) ?? null;
}

function alreadyRegistered(message: string) {
  return /already|registered|exists/i.test(message);
}

export async function registerWithEmail(body: unknown, request?: Request) {
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Invalid sign-up details", 400);
  }

  const email = parsed.data.email;
  const admin = requireAdmin();
  await throttleSend(email, request);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error || !data?.properties?.email_otp) {
    if (error && alreadyRegistered(error.message)) {
      throw new ApiError("An account with this email already exists. Sign in.", 409);
    }
    throw new ApiError(error?.message || "Could not create your account. Try again.", 400);
  }

  await rememberOtpType(email, "signup", "signup");
  await setVerifyCookie(email, "signup");
  await sendOtp(email, data.properties.email_otp, "signup");
  return { email, purpose: "signup" as const };
}

export async function requestPasswordResetOtp(emailInput: string, request?: Request) {
  const parsed = forgotPasswordSchema.safeParse({ email: emailInput });
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Please enter a valid email", 400);
  }

  const email = parsed.data.email;
  const admin = requireAdmin();
  await throttleSend(email, request);

  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data?.properties?.email_otp) {
    return { email, purpose: "recovery" as const };
  }

  await rememberOtpType(email, "recovery", "recovery");
  await setVerifyCookie(email, "recovery");
  await sendOtp(email, data.properties.email_otp, "recovery");
  return { email, purpose: "recovery" as const };
}

export async function resendAuthOtp(body: unknown, request?: Request) {
  const parsed = resendOtpSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Please enter a valid email", 400);
  }

  const email = parsed.data.email;
  const purpose: OtpPurpose = parsed.data.purpose === "recovery" ? "recovery" : "signup";
  const admin = requireAdmin();
  await throttleSend(email, request);

  const pending = await readVerifyCookie();
  const user = await getAuthUserByEmail(email);

  if (purpose === "recovery") {
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
    if (error || !data?.properties?.email_otp) {
      return { email, purpose };
    }
    await rememberOtpType(email, "recovery", "recovery");
    await setVerifyCookie(email, "recovery");
    await sendOtp(email, data.properties.email_otp, "recovery");
    return { email, purpose };
  }

  if (user?.email_confirmed_at) {
    throw new ApiError("This email is already verified. Sign in.", 409);
  }
  if (!user && pending?.email !== email) {
    throw new ApiError("Start from sign-up to get a new code.", 400);
  }

  const { data, error } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (error || !data?.properties?.email_otp) {
    throw new ApiError(error?.message || "Could not send a new code. Try again.", 400);
  }

  await rememberOtpType(email, "signup", "email");
  await setVerifyCookie(email, "signup");
  await sendOtp(email, data.properties.email_otp, "signup");
  return { email, purpose };
}

export async function confirmAuthOtp(body: unknown) {
  const parsed = verifyOtpSchema.safeParse(body);
  if (!parsed.success) {
    throw new ApiError(parsed.error.issues[0]?.message || "Enter the 6-digit code", 400);
  }

  const email = parsed.data.email;
  await hitLimit(`fyte:otp-try:${email}`, 8, 15 * 60);

  const stored = await readOtpType(email);
  const purpose: OtpPurpose = parsed.data.purpose || stored?.purpose || "signup";
  const types: EmailOtpType[] = stored?.type
    ? [stored.type]
    : purpose === "recovery"
      ? ["recovery"]
      : ["signup", "email", "magiclink"];

  const supabase = await createServerSupabase();
  let lastError = "That code is wrong or has expired.";

  for (const type of types) {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: parsed.data.token,
      type,
    });
    if (!error) {
      const store = await cookies();
      store.delete(COOKIE);
      return { purpose };
    }
    lastError = error.message;
  }

  throw new ApiError(lastError, 400);
}
