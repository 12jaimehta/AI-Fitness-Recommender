import { createRating, listRatings } from "@backend/features/fyte-connect";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get("targetType") || "";
    const targetId = searchParams.get("targetId") || "";
    const data = await listRatings(targetType, targetId);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      targetType: string;
      targetId: string;
      rating: number;
      review?: string | null;
    };
    await createRating(body);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
