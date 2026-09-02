import { coerceProgramGoal } from "@/shared/lib/program-goals";

export const CALORIE_STALL_DAYS = 14;
export const CALORIE_STALL_KG = 0.5;
export const CALORIE_STALL_CUT = 200;
export const CALORIE_MIN = 1400;
export const CALORIE_MAX = 4500;

export type WeightPoint = { date: string; kg: number };

export type CalorieStallResult = {
  stalled: boolean;
  applied: boolean;
  days: number;
  fromKg: number | null;
  toKg: number | null;
  deltaKg: number | null;
  calorieDelta: number;
  nextCalories: number | null;
  reason: string;
};

function daysBetween(from: string, to: string) {
  return Math.floor(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000
  );
}

export function isEnduranceGoal(goal: string | null | undefined) {
  const value = coerceProgramGoal(goal);
  return value === "hyrox" || value === "ironman" || value === "running";
}

export function applyCalorieDelta(current: number, delta: number) {
  return Math.min(CALORIE_MAX, Math.max(CALORIE_MIN, Math.round(current + delta)));
}

function emptyStall(
  currentCalories: number | null,
  reason: string
): CalorieStallResult {
  return {
    stalled: false,
    applied: false,
    days: 0,
    fromKg: null,
    toKg: null,
    deltaKg: null,
    calorieDelta: 0,
    nextCalories: currentCalories,
    reason,
  };
}

export function detectCalorieStall(
  weights: WeightPoint[],
  goal: string | null | undefined,
  currentCalories: number | null
): CalorieStallResult {
  const sorted = [...weights]
    .filter((row) => Number.isFinite(row.kg) && row.kg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) {
    return emptyStall(currentCalories, "Need at least two weigh-ins spanning 14 days.");
  }

  const current = sorted[sorted.length - 1];
  const windowCandidates = sorted.filter(
    (row) => daysBetween(row.date, current.date) >= CALORIE_STALL_DAYS
  );
  if (!windowCandidates.length) {
    return emptyStall(
      currentCalories,
      "Weight logs do not span 14 days yet. Keep logging."
    );
  }

  const from = windowCandidates[windowCandidates.length - 1];
  const days = daysBetween(from.date, current.date);
  const deltaKg = Math.round((current.kg - from.kg) * 10) / 10;
  const stalled = Math.abs(deltaKg) < CALORIE_STALL_KG;
  if (!stalled) {
    return {
      stalled: false,
      applied: false,
      days,
      fromKg: from.kg,
      toKg: current.kg,
      deltaKg,
      calorieDelta: 0,
      nextCalories: currentCalories,
      reason: `Weight moved ${deltaKg > 0 ? "+" : ""}${deltaKg} kg over ${days} days.`,
    };
  }

  const fatLoss = coerceProgramGoal(goal) === "fat_loss";
  const sport = isEnduranceGoal(goal);
  const canCut =
    fatLoss && !sport && currentCalories != null && Number.isFinite(currentCalories);
  const calorieDelta = canCut ? -CALORIE_STALL_CUT : 0;
  const nextCalories =
    canCut && currentCalories != null
      ? applyCalorieDelta(currentCalories, calorieDelta)
      : currentCalories;

  let reason = `Weight stalled ${deltaKg > 0 ? "+" : ""}${deltaKg} kg over ${days} days (${from.kg.toFixed(1)} → ${current.kg.toFixed(1)} kg).`;
  if (canCut && nextCalories != null) {
    reason += ` Next week's diet uses ${nextCalories} kcal (${CALORIE_STALL_CUT} less).`;
  } else if (sport) {
    reason += " Endurance goals stay fueled — we are not cutting calories.";
  } else if (!fatLoss) {
    reason += " Calorie cuts apply on a fat-loss goal.";
  }

  return {
    stalled: true,
    applied: Boolean(canCut),
    days,
    fromKg: from.kg,
    toKg: current.kg,
    deltaKg,
    calorieDelta,
    nextCalories,
    reason,
  };
}
