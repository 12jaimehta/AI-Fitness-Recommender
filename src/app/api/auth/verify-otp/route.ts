import { confirmAuthOtp } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const result = await confirmAuthOtp(await readJsonBody(request));
    return jsonOk({
      purpose: result.purpose,
      message: "Email verified.",
    });
  } catch (error) {
    return jsonError(error);
  }
}
