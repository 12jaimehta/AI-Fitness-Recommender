import { workoutPlanSchema, type WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import { completeJson } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { calculateWorkoutMetrics } from "@backend/ai/workout-metrics";
import { buildWorkoutPrompt } from "@backend/ai/prompts/workout";
import { generateFallbackWorkoutPlan } from "@backend/ai/fallbacks/workout";
import { programGoalLabel } from "@/shared/lib/program-goals";
import {
  createThoughtNote,
  scanWorkoutPlanJson,
  withThoughtHeartbeats,
  type StreamThoughtScan,
} from "@backend/shared/lib/plan-thoughts";

export type WorkoutGenerateOptions = {
  logNotes?: string;
  onThought?: (text: string) => void;
};

const EQUIPMENT: Record<WorkoutPlanFormData["availableEquipment"], string> = {
  none: "bodyweight only",
  basic: "dumbbells and bands",
  full_gym: "a full gym",
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
  const note = createThoughtNote(options?.onThought);
  note("Reading your training week.");

  const metrics = calculateWorkoutMetrics(userData);
  const weekly = userData.planType === "weekly";
  note(
    `${userData.workoutFrequency} days a week, ${userData.workoutDuration} minutes, ${userData.fitnessLevel}.`
  );
  note(`${programGoalLabel(userData.goal)}. Training with ${EQUIPMENT[userData.availableEquipment]}.`);
  if (userData.targetMuscles?.length) {
    note(`Bias: ${userData.targetMuscles.slice(0, 4).join(", ")}.`);
  }
  if (userData.injuries?.trim()) {
    note("Working around injuries you listed.");
  }
  note(`About ${metrics.estimatedCaloriesBurn} kcal per session.`);
  note(`Rest: ${metrics.recommendedRestDays.join(", ")}.`);
  note("Asking the coach to write the sessions.");
  if (options?.onThought) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  const prompt = buildWorkoutPrompt(userData, metrics, options?.logNotes);
  const scan: StreamThoughtScan = { left: 12, seen: new Set() };
  const jsonOptions = {
    system: "You are an expert fitness trainer. Reply with valid JSON only.",
  };

  try {
    const plan = options?.onThought
      ? await withThoughtHeartbeats(
          note,
          weekly
            ? [
                "Programming compound work first.",
                "Setting sets, reps, and rest.",
                "Placing rest days so you can recover.",
                "Adding warm-up and cool-down.",
              ]
            : [
                "Programming compound work first.",
                "Setting sets, reps, and rest.",
                "Adding warm-up and cool-down.",
              ],
          (stopHeartbeats) =>
            completeJson<WorkoutPlanData>(prompt, {
              ...jsonOptions,
              onDelta: (text) => {
                stopHeartbeats();
                scanWorkoutPlanJson(text, note, scan);
              },
            })
        )
      : await completeJson<WorkoutPlanData>(prompt, jsonOptions);

    if (!isValidWorkoutPlan(plan, weekly)) {
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
