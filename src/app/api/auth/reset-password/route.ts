import { updateAccountPassword } from "@backend/features/auth";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    await updateAccountPassword(await readJsonBody(request));
    return jsonOk({ message: "Password updated." });
  } catch (error) {
    return jsonError(error);
  }
}
