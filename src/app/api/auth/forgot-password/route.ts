import { requestPasswordResetOtp } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { email?: string };
    const result = await requestPasswordResetOtp(body.email || "", request);
    return jsonOk({
      email: result.email,
      message: "If an account exists for that email, we sent a 6-digit code.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
