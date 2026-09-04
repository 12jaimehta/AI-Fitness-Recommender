import { requestPasswordReset } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody, requestOrigin } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { email?: string };
    await requestPasswordReset(body.email || "", requestOrigin(request));
    return jsonOk({
      message: "If an account exists for that email, we sent a reset link.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
