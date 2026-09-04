import type { CoachWeekDecision } from "@/shared/types/coach";
import { weekCopy } from "./copy";

export type WeekReviewInput = {
  goal: string | null;
  daysLogged: number;
  sessionsPlanned: number;
  sessionsDone: number;
  mealsPlanned: number;
  mealsFollowed: number;
  weightDeltaKg: number | null;
  waistDeltaCm: number | null;
  spanDays: number;
  highAdherence: boolean;
  lowEnergyDays: number;
};

export function decideWeek(input: WeekReviewInput): CoachWeekDecision {
  const attendance =
    input.sessionsPlanned > 0 ? input.sessionsDone / input.sessionsPlanned : 1;
  if (input.sessionsPlanned >= 3 && attendance < 0.6) return "fix_schedule";

  if (input.lowEnergyDays >= 4) return "eat_more";

  const fatLoss = input.goal === "fat_loss";
  const quietScale =
    input.weightDeltaKg != null && Math.abs(input.weightDeltaKg) < 0.5;
  const quietWaist =
    input.waistDeltaCm == null || Math.abs(input.waistDeltaCm) < 1;
  if (
    fatLoss &&
    input.highAdherence &&
    input.spanDays >= 21 &&
    quietScale &&
    quietWaist
  ) {
    return "extra_steps";
  }

  return "hold";
}

export function buildWeekReview(input: WeekReviewInput) {
  const decision = decideWeek(input);
  const attendancePct =
    input.sessionsPlanned > 0
      ? Math.round((input.sessionsDone / input.sessionsPlanned) * 1000) / 10
      : null;
  const mealAdherencePct =
    input.mealsPlanned > 0
      ? Math.round((input.mealsFollowed / input.mealsPlanned) * 1000) / 10
      : null;
  const copy = weekCopy(decision, attendancePct, mealAdherencePct);
  return {
    decision,
    attendancePct,
    mealAdherencePct,
    headline: copy.headline,
    body: copy.body,
  };
}

export function mealFollowed(status: string) {
  return status === "as_planned" || status === "replaced";
}
