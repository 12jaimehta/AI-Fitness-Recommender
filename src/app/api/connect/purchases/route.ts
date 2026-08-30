import { purchasePlan } from "@backend/features/fyte-connect";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as { planId: string };
    await purchasePlan(body.planId);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
