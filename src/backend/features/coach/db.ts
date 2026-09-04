import { ApiError } from "@backend/shared/lib/errors";
import type { CoachFeel, CoachSlotKind, CoachSlotStatus } from "@/shared/types/coach";

export function throwIfCoachSchemaMissing(error: { message?: string } | null) {
  if (!error) return;
  const message = error.message || "";
  if (/does not exist|schema cache|could not find the table/i.test(message)) {
    throw new ApiError(
      "Paste supabase/schema/11_coach.sql in the Supabase SQL editor, then open Coach again.",
      400
    );
  }
}

export function isCoachSchemaMissing(error: unknown) {
  const message = error instanceof ApiError ? error.message : error instanceof Error ? error.message : String(error || "");
  return /11_coach\.sql|does not exist|schema cache|could not find the table/i.test(message);
}

export type CoachSlotRow = {
  id: string;
  user_id: string;
  date: string;
  kind: CoachSlotKind;
  slot_key: string;
  title: string;
  budget_kcal: number;
  budget_protein_g: number;
  status: CoachSlotStatus;
  actual_kcal: number | null;
  actual_protein_g: number | null;
  actual_label: string | null;
  feel: CoachFeel | null;
  plan_ref: Record<string, unknown>;
};

export type CoachDailyRow = {
  user_id: string;
  date: string;
  planned_kcal: number;
  actual_kcal: number;
  surplus_kcal: number;
  extra_steps_target: number;
  extra_steps_done: number;
  carryover_kcal: number;
  carryover_applied: boolean;
  meals_planned: number;
  meals_logged: number;
  session_planned: boolean;
  session_done: boolean;
  weight_kg: number | null;
  sleep_hours: number | null;
  energy: string | null;
};

export function asSlot(row: Record<string, unknown>): CoachSlotRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    date: String(row.date).slice(0, 10),
    kind: row.kind as CoachSlotKind,
    slot_key: String(row.slot_key),
    title: String(row.title),
    budget_kcal: Number(row.budget_kcal || 0),
    budget_protein_g: Number(row.budget_protein_g || 0),
    status: row.status as CoachSlotStatus,
    actual_kcal: row.actual_kcal == null ? null : Number(row.actual_kcal),
    actual_protein_g: row.actual_protein_g == null ? null : Number(row.actual_protein_g),
    actual_label: row.actual_label ? String(row.actual_label) : null,
    feel: (row.feel as CoachFeel | null) || null,
    plan_ref: row.plan_ref && typeof row.plan_ref === "object" ? (row.plan_ref as Record<string, unknown>) : {},
  };
}
