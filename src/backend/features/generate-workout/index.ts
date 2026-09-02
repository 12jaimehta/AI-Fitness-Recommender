import { workoutPlanSchema, type WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import { completeJson } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { calculateWorkoutMetrics } from "@backend/ai/workout-metrics";
import { buildWorkoutPrompt } from "@backend/ai/prompts/workout";
import { generateFallbackWorkoutPlan } from "@backend/ai/fallbacks/workout";

export type WorkoutGenerateOptions = {
  logNotes?: string;
};

function isValidWorkoutPlan(plan: WorkoutPlanData | null, weekly: boolean) {
  if (!plan?.workoutTips) return false;
  return weekly ? Boolean(plan.weeklyPlan) : Boolean(plan.singleWorkout);
}

export async function generateWorkoutPlan(
  input: unknown,
  options?: WorkoutGenerateOptions
): Promise<WorkoutPlanData> {
  const parsed = workoutPlanSchema.safeParse(input);
  if (!parsed.success) {
    throw new ApiError("Invalid request body", 400, parsed.error.flatten());
  }

  const userData = parsed.data as WorkoutPlanFormData;
  const metrics = calculateWorkoutMetrics(userData);
  const prompt = buildWorkoutPrompt(userData, metrics, options?.logNotes);

  try {
    const plan = await completeJson<WorkoutPlanData>(prompt, {
      system: "You are an expert fitness trainer. Reply with valid JSON only.",
    });

    if (!isValidWorkoutPlan(plan, userData.planType === "weekly")) {
      return generateFallbackWorkoutPlan(
        userData,
        metrics.estimatedCaloriesBurn,
        metrics.recommendedRestDays
      );
    }

    return plan;
  } catch {
    return generateFallbackWorkoutPlan(
      userData,
      metrics.estimatedCaloriesBurn,
      metrics.recommendedRestDays
    );
  }
}
