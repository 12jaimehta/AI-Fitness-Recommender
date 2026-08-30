import { ApiError } from "@backend/shared/lib/errors";
import { getEmailEnv } from "@backend/shared/config/env";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const { to, subject, html } = input;
  if (!to || !subject || !html) {
    throw new ApiError("Missing required fields: to, subject, html", 400);
  }
  if (!EMAIL_RE.test(to)) {
    throw new ApiError("Invalid email address", 400);
  }

  const { resendKey, from } = getEmailEnv();

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new ApiError("Failed to send email", 502, details);
    }

    return {
      success: true,
      message: "Diet plan sent successfully to your email",
      sentTo: to,
      timestamp: new Date().toISOString(),
    };
  }

  console.log("Email simulated (no RESEND_API_KEY):", { to, subject, htmlLength: html.length });
  return {
    success: true,
    message: "Diet plan sent successfully to your email",
    sentTo: to,
    timestamp: new Date().toISOString(),
    simulated: true,
  };
}
