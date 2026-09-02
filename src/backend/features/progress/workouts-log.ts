import { completeJson } from "@backend/shared/api/grok";
import { ApiError } from "@backend/shared/lib/errors";
import { resolveAuth, type AuthCtx } from "@backend/shared/api/supabase";
import { emptySetsForExercise } from "@/shared/lib/current-plans";
import type {
  ExerciseLogEntry,
  WorkoutLogRow,
  WorkoutSetEntry,
  WorkoutSourceType,
} from "@/shared/types/progress-tracking";
import { workingSetsDone } from "@/shared/lib/daily-track";
import { getCurrentPlans } from "./current-plans";
import { civilDate, parseLogDate, throwIfSchemaMissing } from "./db";
import { rebuildDailyTrackDay } from "./track-day";
import { buildWorkoutLogPrompt } from "@backend/ai/prompts/workout-log";

function asSets(value: unknown): WorkoutSetEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((set, i) => ({
    id: String(set?.id || `set-${i}`),
    kind: set?.kind === "warmup" || set?.kind === "special" ? set.kind : "working",
    weight_kg: Number(set?.weight_kg || 0),
    reps: Number(set?.reps || 0),
  }));
}

function asExercises(value: unknown): ExerciseLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    exercise_id: String(item?.exercise_id || item?.exercise_name || ""),
    exercise_name: String(item?.exercise_name || "Exercise"),
    target_sets: Number(item?.target_sets || 0),
    target_reps: String(item?.target_reps || ""),
    muscle_group: String(item?.muscle_group || ""),
    sets: asSets(item?.sets),
  }));
}

function asWorkoutLog(row: Record<string, unknown>): WorkoutLogRow {
  const exercises = asExercises(row.exercises_completed);
  return {
    id: String(row.id),
    date: civilDate(row.date),
    workout_plan_id: row.workout_plan_id ? String(row.workout_plan_id) : null,
    source_type: row.source_type as WorkoutSourceType,
    title: String(row.title),
    duration_minutes: Number(row.duration_minutes || 0),
    rpe_rating: row.rpe_rating == null ? null : Number(row.rpe_rating),
    calories_burned_estimated: row.calories_burned_estimated == null ? null : Number(row.calories_burned_estimated),
    exercises_completed: exercises,
    is_completed: Boolean(row.is_completed) || workingSetsDone(exercises) > 0,
    notes: row.notes ? String(row.notes) : null,
  };
}

export async function getWorkoutLog(date: string, auth?: AuthCtx) {
  const { supabase, user } = await resolveAuth(auth);
  const { data, error } = await supabase
    .from("workout_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", date)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  return data ? asWorkoutLog(data as Record<string, unknown>) : null;
}

async function upsertWorkout(payload: Record<string, unknown>, auth?: AuthCtx) {
  const resolved = await resolveAuth(auth);
  const { supabase, user } = resolved;
  const date = String(payload.date);
  const existing = await getWorkoutLog(date, resolved);

  if (existing) {
    const { data, error } = await supabase
      .from("workout_logs")
      .update(payload)
      .eq("id", existing.id)
      .eq("user_id", user.id)
      .select()
      .single();
    throwIfSchemaMissing(error);
    if (error) throw new ApiError(error.message, 400);
    const updated = asWorkoutLog(data as Record<string, unknown>);
    await rebuildDailyTrackDay(date, resolved);
    return updated;
  }

  const { data, error } = await supabase
    .from("workout_logs")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();
  throwIfSchemaMissing(error);
  if (error) throw new ApiError(error.message, 400);
  const created = asWorkoutLog(data as Record<string, unknown>);
  await rebuildDailyTrackDay(date, resolved);
  return created;
}

export async function quickCheckWorkout(input: {
  date?: string;
  rpe_rating?: number;
  duration_minutes?: number;
  notes?: string;
}) {
  const resolved = await resolveAuth();
  const date = parseLogDate(input.date);
  const plans = await getCurrentPlans(date, resolved);
  const today = plans.workout_plan?.today_workout;
  const existing = await getWorkoutLog(date, resolved);

  if (existing && (existing.is_completed || workingSetsDone(existing.exercises_completed) > 0) && !input.duration_minutes) {
    const { supabase, user } = resolved;
    const { error } = await supabase.from("workout_logs").delete().eq("id", existing.id).eq("user_id", user.id);
    if (error) throw new ApiError(error.message, 400);
    await rebuildDailyTrackDay(date, resolved);
    return { removed: true, data: null };
  }

  const exercises =
    existing?.exercises_completed?.length
      ? existing.exercises_completed
      : (today?.exercises || []).map((exercise) => ({
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.name,
          target_sets: exercise.target_sets,
          target_reps: exercise.target_reps,
          muscle_group: exercise.muscle_group,
          sets: emptySetsForExercise(exercise),
        }));

  const data = await upsertWorkout(
    {
      date,
      workout_plan_id: plans.workout_plan?.id || existing?.workout_plan_id || null,
      source_type: today && !today.is_rest_day ? "plan_checkoff" : existing?.source_type || "manual",
      title: (today && !today.is_rest_day ? today.focus_area : null) || existing?.title || "Workout",
      duration_minutes: Number(
        input.duration_minutes || existing?.duration_minutes || today?.estimated_duration_min || 45
      ),
      rpe_rating: input.rpe_rating ?? existing?.rpe_rating ?? 7,
      calories_burned_estimated: today?.estimated_calories ?? existing?.calories_burned_estimated ?? 0,
      exercises_completed: exercises,
      is_completed: true,
      notes: input.notes || existing?.notes || null,
    },
    resolved
  );
  return { removed: false, data };
}

export async function saveWorkoutLog(input: {
  date?: string;
  exercises_completed?: ExerciseLogEntry[];
  duration_minutes?: number;
  rpe_rating?: number;
  is_completed?: boolean;
  notes?: string;
  title?: string;
}) {
  const resolved = await resolveAuth();
  const date = parseLogDate(input.date);
  const plans = await getCurrentPlans(date, resolved);
  const today = plans.workout_plan?.today_workout;
  const existing = await getWorkoutLog(date, resolved);
  const exercises = input.exercises_completed ?? existing?.exercises_completed ?? [];
  const trained = workingSetsDone(exercises) > 0;

  return upsertWorkout(
    {
      date,
      workout_plan_id: plans.workout_plan?.id || existing?.workout_plan_id || null,
      source_type: existing?.source_type || "manual",
      title: input.title || existing?.title || today?.focus_area || "Workout",
      duration_minutes: Number(input.duration_minutes ?? existing?.duration_minutes ?? today?.estimated_duration_min ?? 45),
      rpe_rating: input.rpe_rating ?? existing?.rpe_rating ?? null,
      calories_burned_estimated: existing?.calories_burned_estimated ?? today?.estimated_calories ?? null,
      exercises_completed: exercises,
      is_completed: Boolean(input.is_completed) || trained || Boolean(existing?.is_completed),
      notes: input.notes ?? existing?.notes ?? null,
    },
    resolved
  );
}

export async function aiLogWorkout(input: { date?: string; text_prompt?: string }) {
  const text = String(input.text_prompt || "").trim();
  if (!text) throw new ApiError("Describe your workout.", 400);
  const date = parseLogDate(input.date);

  type Parsed = {
    title: string;
    duration_minutes: number;
    estimated_calories_burned: number;
    exercises_completed: { exercise_name: string; sets_completed?: number; reps_done?: string }[];
  };

  let parsed: Parsed;
  try {
    parsed = await completeJson<Parsed>(buildWorkoutLogPrompt(text), { maxTokens: 500 });
  } catch {
    parsed = {
      title: text.slice(0, 80),
      duration_minutes: 30,
      estimated_calories_burned: 200,
      exercises_completed: [{ exercise_name: text.slice(0, 80), sets_completed: 1, reps_done: "session" }],
    };
  }

  const exercises: ExerciseLogEntry[] = (parsed.exercises_completed || []).map((item, i) => ({
    exercise_id: `ai-${i}-${item.exercise_name}`,
    exercise_name: item.exercise_name,
    target_sets: Number(item.sets_completed || 1),
    target_reps: String(item.reps_done || ""),
    muscle_group: "",
    sets: [],
  }));

  return upsertWorkout({
    date,
    source_type: "ai_text",
    title: parsed.title || "Workout",
    duration_minutes: parsed.duration_minutes || 30,
    rpe_rating: null,
    calories_burned_estimated: parsed.estimated_calories_burned || 0,
    exercises_completed: exercises,
    is_completed: true,
    notes: text,
  });
}
