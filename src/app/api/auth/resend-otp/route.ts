import { resendAuthOtp } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const result = await resendAuthOtp(await readJsonBody(request), request);
    return jsonOk({
      email: result.email,
      message: "If that email can be verified, we sent a new code.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
