import { signInWithEmailPassword } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const result = await signInWithEmailPassword(await readJsonBody(request));
    return jsonOk({ message: "Signed in.", email: result.email });
  } catch (error) {
    return jsonError(error);
  }
}
