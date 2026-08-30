function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it in .env — see keys.md`);
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getGrokEnv() {
  return {
    apiKey: required("XAI_API_KEY"),
    model: process.env.GROK_MODEL || "grok-4.6",
    baseUrl: process.env.XAI_BASE_URL || "https://api.x.ai/v1",
  };
}

export function getEmailEnv() {
  return {
    resendKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || "FyteAI <noreply@fyteai.co.in>",
  };
}
