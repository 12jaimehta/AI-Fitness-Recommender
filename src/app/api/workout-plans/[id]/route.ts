import { deleteWorkoutPlan } from "@backend/features/workout-plans";
import { jsonError, jsonOk } from "@backend/shared";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteWorkoutPlan(id);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
