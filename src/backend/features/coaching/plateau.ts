import type { PlateauFlag } from "@/shared/types/progress-tracking";
import { coerceProgramGoal } from "@/shared/lib/program-goals";
import { detectCalorieStall } from "@/shared/lib/calorie-stall";

export type WeightPoint = { date: string; kg: number };

export type PlateauInput = {
  startWeightKg: number | null;
  weights: WeightPoint[];
  dietAgeDays: number | null;
  workoutAgeDays: number | null;
  workoutSessionsLast42Days: number;
  workoutFrequency: number;
  goal: string | null;
};

export type PlateauResult = {
  flags: PlateauFlag[];
  reasons: string[];
};

function daysBetween(from: string, to: string) {
  return Math.floor((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

export function detectPlateaus(input: PlateauInput): PlateauResult {
  const flags: PlateauFlag[] = [];
  const reasons: string[] = [];
  const sorted = [...input.weights]
    .filter((row) => Number.isFinite(row.kg) && row.kg > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
  const current = sorted[sorted.length - 1] || null;
  const start = input.startWeightKg || sorted[0]?.kg || null;
  const goal = coerceProgramGoal(input.goal);

  if (start && current) {
    const lostKg = start - current.kg;
    const lostPct = lostKg / start;
    const significantLoss = lostKg >= 4 || lostPct >= 0.05;
    const windowStart = sorted.find((row) => daysBetween(row.date, current.date) <= 21) || current;
    const spanDays = daysBetween(windowStart.date, current.date);
    const recentDelta = current.kg - windowStart.kg;

    if (significantLoss && sorted.length >= 3 && spanDays >= 10 && Math.abs(recentDelta) < 0.6) {
      flags.push("weight_loss_plateau");
      reasons.push(
        `Weight dropped ${lostKg.toFixed(1)} kg from ${start.toFixed(1)} kg, then stayed within 0.6 kg for ${spanDays} days.`
      );
    }
  }

  const stall = detectCalorieStall(sorted, goal, null);
  if (stall.stalled) {
    flags.push("calorie_stall_14d");
    reasons.push(stall.reason);
  }

  if (input.dietAgeDays != null && input.dietAgeDays >= 28) {
    flags.push("stale_diet");
    reasons.push(`This diet has been in use for ${input.dietAgeDays} days.`);
  }

  if (input.workoutAgeDays != null && input.workoutAgeDays >= 42) {
    flags.push("stale_workout");
    reasons.push(`This workout plan has been in use for ${input.workoutAgeDays} days.`);
  }

  const expectedSessions = Math.max(input.workoutFrequency, 1) * 6;
  if (
    input.workoutAgeDays != null &&
    input.workoutAgeDays >= 42 &&
    input.workoutSessionsLast42Days >= Math.min(expectedSessions, 12)
  ) {
    flags.push("training_stagnation");
    reasons.push(
      `You logged ${input.workoutSessionsLast42Days} sessions in 6 weeks on the same plan. The body usually adapts by then.`
    );
  }

  if (goal === "hyrox" || goal === "ironman" || goal === "running") {
    return {
      flags,
      reasons: reasons.map((reason) =>
        flags.includes("weight_loss_plateau")
          ? `${reason} For this sport, fueling usually matters more than a smaller deficit.`
          : reason
      ),
    };
  }

  return { flags, reasons };
}
