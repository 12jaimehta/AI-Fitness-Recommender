import { createWorkoutPlan, listWorkoutPlans } from "@backend/features/workout-plans";
import { jsonError, jsonOk, readJsonBody } from "@backend/shared";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";

export async function GET() {
  try {
    const data = await listWorkoutPlans();
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await readJsonBody(request)) as {
      formData: WorkoutPlanFormData;
      workoutPlan: WorkoutPlanData;
      title?: string;
      description?: string;
    };
    const data = await createWorkoutPlan(body);
    return jsonOk({ data });
  } catch (error) {
    return jsonError(error);
  }
}
