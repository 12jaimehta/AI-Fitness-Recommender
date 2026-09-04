import { resolveAuth } from "@backend/shared/api/supabase";
import { ApiError } from "@backend/shared/lib/errors";
import { parseLogDate } from "@backend/features/progress/db";
import { asPlannedCopy, doneSessionCopy, skippedSessionCopy } from "@/shared/lib/coach/copy";
import type { CoachEnergy, CoachFeel } from "@/shared/types/coach";
import { throwIfCoachSchemaMissing } from "./db";
import { insertEvent } from "./events";
import { getTodayBoard, listSlots, projectDaily, ensureDay } from "./board";

async function slotFor(auth: Awaited<ReturnType<typeof resolveAuth>>, date: string, slotKey: string, kind: "meal" | "session") {
  const slots = await listSlots(auth, date);
  const slot = slots.find((item) => item.kind === kind && item.slot_key === slotKey);
  if (!slot) throw new ApiError("That slot is not on today's plan.", 400);
  return slot;
}

export async function checkin(input: {
  date?: string;
  action: "as_planned" | "session_done" | "session_skipped" | "vitals" | "steps";
  slot_key?: string;
  feel?: CoachFeel;
  weight_kg?: number | null;
  sleep_hours?: number | null;
  energy?: CoachEnergy | null;
  extra_steps_done?: number;
  client_event_id?: string;
}) {
  const auth = await resolveAuth();
  const date = parseLogDate(input.date);
  await ensureDay(date, auth);

  if (input.action === "as_planned") {
    const slot = await slotFor(auth, date, String(input.slot_key || ""), "meal");
    const { error } = await auth.supabase
      .from("coach_slots")
      .update({
        status: "as_planned",
        actual_kcal: slot.budget_kcal,
        actual_protein_g: slot.budget_protein_g,
        actual_label: slot.title,
      })
      .eq("id", slot.id)
      .eq("user_id", auth.user.id);
    throwIfCoachSchemaMissing(error);
    if (error) throw new ApiError(error.message, 400);
    await insertEvent(auth, {
      date,
      slotId: slot.id,
      kind: "as_planned",
      payload: { slot_key: slot.slot_key },
      clientEventId: input.client_event_id,
    });
    await projectDaily(auth, date);
  }

  if (input.action === "session_done" || input.action === "session_skipped") {
    const slot = await slotFor(auth, date, "workout", "session");
    const done = input.action === "session_done";
    const feel = done ? input.feel || "right" : null;
    const { error } = await auth.supabase
      .from("coach_slots")
      .update({
        status: done ? "done" : "skipped",
        feel,
        actual_label: done ? "Trained" : "Skipped",
        actual_kcal: done ? slot.budget_kcal : 0,
      })
      .eq("id", slot.id)
      .eq("user_id", auth.user.id);
    throwIfCoachSchemaMissing(error);
    if (error) throw new ApiError(error.message, 400);
    await insertEvent(auth, {
      date,
      slotId: slot.id,
      kind: input.action,
      payload: { feel },
      clientEventId: input.client_event_id,
    });
    await projectDaily(auth, date);
  }

  if (input.action === "vitals" || input.action === "steps") {
    const current = await auth.supabase
      .from("coach_daily")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("date", date)
      .maybeSingle();
    throwIfCoachSchemaMissing(current.error);
    const patch: Record<string, unknown> = {
      user_id: auth.user.id,
      date,
    };
    if (input.weight_kg != null) patch.weight_kg = input.weight_kg;
    if (input.sleep_hours != null) patch.sleep_hours = input.sleep_hours;
    if (input.energy) patch.energy = input.energy;
    if (input.extra_steps_done != null) patch.extra_steps_done = Math.max(0, Math.round(input.extra_steps_done));
    const { error } = await auth.supabase.from("coach_daily").upsert(
      { ...(current.data || {}), ...patch },
      { onConflict: "user_id,date" }
    );
    throwIfCoachSchemaMissing(error);
    if (error) throw new ApiError(error.message, 400);
    await insertEvent(auth, {
      date,
      kind: input.action,
      payload: patch,
      clientEventId: input.client_event_id,
    });
    if (input.weight_kg != null) {
      await auth.supabase.from("daily_progress_logs").upsert(
        { user_id: auth.user.id, date, weight_kg: input.weight_kg },
        { onConflict: "user_id,date" }
      );
    }
  }

  const board = await getTodayBoard(date, auth);
  let note = "";
  if (input.action === "as_planned") {
    const meal = board.meals.find((item) => item.slotKey === input.slot_key);
    note = asPlannedCopy(meal?.title || "Meal");
  }
  if (input.action === "session_done") note = doneSessionCopy(input.feel || "right");
  if (input.action === "session_skipped") note = skippedSessionCopy();
  return { board, note };
}
