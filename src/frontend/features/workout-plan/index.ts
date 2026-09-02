/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "@frontend/shared/api/http";
import type { WorkoutPlanFormData } from "@/shared/validation/workoutPlanSchema";
import type { WorkoutPlanData } from "@/shared/types";
import {
  storeGeneratedWorkoutPlan,
  readGeneratedWorkoutPlan,
  clearGeneratedWorkoutPlan,
  setPendingWorkoutGeneration,
  setPendingWorkoutFromLogs,
  setPendingWorkoutError,
  clearPendingWorkoutGeneration,
  readPendingWorkoutGeneration,
  type GeneratedWorkoutSession,
} from "./generated-session";
import { hydratePlanCache } from "@frontend/features/plan-cache";

export type { WorkoutPlanData, DailyWorkout, Exercise } from "@/shared/types";
export {
  storeGeneratedWorkoutPlan,
  readGeneratedWorkoutPlan,
  readPendingWorkoutGeneration,
  type GeneratedWorkoutSession,
};

let inFlight: Promise<WorkoutPlanData> | null = null;
let inFlightKey = "";

function sameForm(a: WorkoutPlanFormData, b: WorkoutPlanFormData) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export async function generateAIWorkoutPlan(
  userData: WorkoutPlanFormData
): Promise<WorkoutPlanData> {
  const existing = readGeneratedWorkoutPlan();
  if (existing && sameForm(existing.formData, userData)) return existing.plan;

  const key = JSON.stringify(userData);
  if (inFlight && inFlightKey === key) return inFlight;

  inFlightKey = key;
  inFlight = api<WorkoutPlanData>("/api/generate-workout", {
    method: "POST",
    body: JSON.stringify(userData),
  }).finally(() => {
    inFlight = null;
    inFlightKey = "";
  });

  return inFlight;
}

export function beginWorkoutPlanGeneration(formData: WorkoutPlanFormData) {
  clearGeneratedWorkoutPlan();
  setPendingWorkoutGeneration(formData);
  void generateAIWorkoutPlan(formData)
    .then((plan) => {
      storeGeneratedWorkoutPlan({ formData, plan });
      clearPendingWorkoutGeneration();
    })
    .catch((err) => {
      setPendingWorkoutError(
        err instanceof Error ? err.message : "Could not make your workout plan. Try again."
      );
    });
}

export type AdvanceWorkoutResult = {
  formData: WorkoutPlanFormData;
  plan: WorkoutPlanData;
};

let fromLogsInFlight: Promise<AdvanceWorkoutResult> | null = null;

export async function generateWorkoutFromLogs(): Promise<AdvanceWorkoutResult> {
  if (fromLogsInFlight) return fromLogsInFlight;
  fromLogsInFlight = api<AdvanceWorkoutResult>("/api/generate-workout/from-logs", {
    method: "POST",
  }).finally(() => {
    fromLogsInFlight = null;
  });
  return fromLogsInFlight;
}

export function beginWorkoutFromLogs() {
  clearGeneratedWorkoutPlan();
  setPendingWorkoutFromLogs();
  void generateWorkoutFromLogs()
    .then((result) => {
      storeGeneratedWorkoutPlan({ formData: result.formData, plan: result.plan });
      clearPendingWorkoutGeneration();
    })
    .catch((err) => {
      setPendingWorkoutError(
        err instanceof Error
          ? err.message
          : "Could not build next week's workout from your logs. Try again."
      );
    });
}

export type WorkoutPlanResolveResult =
  | { status: "ready"; session: GeneratedWorkoutSession }
  | { status: "missing" }
  | { status: "error"; error: string };

export async function resolveWorkoutPlan(userId?: string): Promise<WorkoutPlanResolveResult> {
  const pending = readPendingWorkoutGeneration();
  if (pending?.error) return { status: "error", error: pending.error };

  if (pending?.fromLogs) {
    try {
      const result = await generateWorkoutFromLogs();
      const session = { formData: result.formData, plan: result.plan };
      storeGeneratedWorkoutPlan(session);
      clearPendingWorkoutGeneration();
      return { status: "ready", session };
    } catch (err) {
      const error =
        err instanceof Error
          ? err.message
          : "Could not build next week's workout from your logs. Try again.";
      setPendingWorkoutError(error);
      return { status: "error", error };
    }
  }

  if (pending?.formData) {
    const already = readGeneratedWorkoutPlan();
    if (already && sameForm(already.formData, pending.formData)) {
      clearPendingWorkoutGeneration();
      if (userId) void saveWorkoutPlan(userId, already.formData, already.plan).catch(() => {});
      return { status: "ready", session: already };
    }
    try {
      const plan = await generateAIWorkoutPlan(pending.formData);
      const session = { formData: pending.formData, plan };
      storeGeneratedWorkoutPlan(session);
      clearPendingWorkoutGeneration();
      if (userId) void saveWorkoutPlan(userId, pending.formData, plan).catch(() => {});
      return { status: "ready", session };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Could not make your workout plan. Try again.";
      setPendingWorkoutError(error);
      return { status: "error", error };
    }
  }

  const stored = await loadCurrentWorkoutPlan();
  if (stored) return { status: "ready", session: stored };
  return { status: "missing" };
}

export type SavedWorkoutPlan = {
  id: string;
  user_id: string;
  form_data: WorkoutPlanFormData;
  workout_plan: WorkoutPlanData;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
};

export async function saveWorkoutPlan(
  _userId: string,
  formData: WorkoutPlanFormData,
  workoutPlan: WorkoutPlanData,
  title?: string,
  description?: string
) {
  const result = await api<{ data: SavedWorkoutPlan }>("/api/workout-plans", {
    method: "POST",
    body: JSON.stringify({ formData, workoutPlan, title, description }),
  });
  return result.data;
}

export async function getUserWorkoutPlans(_userId: string) {
  const result = await api<{ data: SavedWorkoutPlan[] }>("/api/workout-plans");
  return result.data;
}

export async function deleteWorkoutPlan(_userId: string, planId: string) {
  await api(`/api/workout-plans/${planId}`, { method: "DELETE" });
  clearGeneratedWorkoutPlan();
}

export async function loadCurrentWorkoutPlan(): Promise<GeneratedWorkoutSession | null> {
  await hydratePlanCache();
  return readGeneratedWorkoutPlan();
}
