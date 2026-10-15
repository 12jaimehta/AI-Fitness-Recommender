import { registerWithEmail } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const result = await registerWithEmail(await readJsonBody(request), request);
    return jsonOk({
      email: result.email,
      message: "We sent a 6-digit code to your email.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
