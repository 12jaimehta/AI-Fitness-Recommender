import { getOwnTrainerProfile, upsertTrainerProfile } from "@backend/features/fyte-connect";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import type { TrainerFormData } from "@/shared/validation/becometrainer";

export async function GET() {
  try {
    const data = await getOwnTrainerProfile();
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as TrainerFormData;
    const data = await upsertTrainerProfile(body);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
