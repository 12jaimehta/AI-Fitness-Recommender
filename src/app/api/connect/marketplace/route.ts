import { getMarketplace } from "@backend/features/fyte-connect";
import { jsonError, jsonOk } from "@backend/shared";

export async function GET() {
  try {
    const data = await getMarketplace();
    return jsonOk(data);
  } catch (error) {
    return jsonError(error);
  }
}
