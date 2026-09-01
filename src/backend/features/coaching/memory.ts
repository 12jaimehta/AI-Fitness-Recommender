import type { CoachingAdvice, PlateauFlag } from "@/shared/types/progress-tracking";

export type CoachingFacts = {
  start_weight_kg: number | null;
  last_weight_kg: number | null;
  last_weight_date: string | null;
  lowest_weight_kg: number | null;
  diet_plan_id: string | null;
  diet_plan_started_at: string | null;
  diet_goal: string | null;
  dietary_preference: string | null;
  calorie_target: number | null;
  workout_plan_id: string | null;
  workout_plan_started_at: string | null;
  workout_weeks: number | null;
  typical_calorie_adherence_pct: number | null;
  typical_protein_adherence_pct: number | null;
  last_plateau_flags: PlateauFlag[];
  last_calorie_suggestion: number | null;
};

export type CoachingNote = {
  at: string;
  text: string;
  flags: PlateauFlag[];
};

export type CoachingMemoryRow = {
  facts: CoachingFacts;
  notes: CoachingNote[];
  last_advice: CoachingAdvice | null;
  last_advice_at: string | null;
  fingerprint: string | null;
};

export function emptyFacts(): CoachingFacts {
  return {
    start_weight_kg: null,
    last_weight_kg: null,
    last_weight_date: null,
    lowest_weight_kg: null,
    diet_plan_id: null,
    diet_plan_started_at: null,
    diet_goal: null,
    dietary_preference: null,
    calorie_target: null,
    workout_plan_id: null,
    workout_plan_started_at: null,
    workout_weeks: null,
    typical_calorie_adherence_pct: null,
    typical_protein_adherence_pct: null,
    last_plateau_flags: [],
    last_calorie_suggestion: null,
  };
}

export function parseMemory(row: {
  facts?: unknown;
  notes?: unknown;
  last_advice?: CoachingAdvice | null;
  last_advice_at?: string | null;
  fingerprint?: string | null;
} | null): CoachingMemoryRow {
  const facts = { ...emptyFacts(), ...((row?.facts || {}) as Partial<CoachingFacts>) };
  const notes = Array.isArray(row?.notes) ? (row.notes as CoachingNote[]) : [];
  return {
    facts,
    notes: notes.filter((note) => note?.text).slice(-12),
    last_advice: row?.last_advice || null,
    last_advice_at: row?.last_advice_at || null,
    fingerprint: row?.fingerprint || null,
  };
}
