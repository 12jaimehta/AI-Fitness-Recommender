import { createBooking } from "@backend/features/fyte-connect";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      trainerId: string;
      sessionDate: string;
      notes?: string | null;
    };
    await createBooking(body);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
