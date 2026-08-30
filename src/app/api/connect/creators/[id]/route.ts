import { getCreator } from "@backend/features/fyte-connect";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getCreator(id);
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
