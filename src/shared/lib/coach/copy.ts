import { adderNote } from "./adders";
import type { CoachWeekDecision } from "@/shared/types/coach";

export function mealOtherCopy(input: {
  food: string;
  actual: number;
  budget: number;
  surplus: number;
  steps: number;
  delayDays: number;
  answers: Record<string, string>;
}) {
  const extras = adderNote(input.answers);
  const food = extras ? `${input.food} (${extras})` : input.food;
  if (input.surplus <= 40) {
    return `${food} is about ${input.actual} kcal vs ${input.budget} on the plan. That holds today.`;
  }
  const delay =
    input.delayDays >= 0.2
      ? ` If the extra walk does not happen, this is about ${input.delayDays} day${input.delayDays === 1 ? "" : "s"} on a fat-loss goal.`
      : "";
  return `About ${input.actual} kcal vs ${input.budget} planned (${input.surplus} extra). Walk about ${input.steps.toLocaleString()} extra steps today to hold it. If you don't, tomorrow's remaining meal is smaller.${delay}`;
}

export function replacedMealCopy(name: string, kcal: number) {
  return `${name} (${kcal} kcal) is in for this slot. The rest of the day stays.`;
}

export function asPlannedCopy(title: string) {
  return `${title} logged as planned.`;
}

export function skippedSessionCopy() {
  return "Session skipped. We will not pile guilt on — the week still counts. If this keeps happening we shorten the week, not the goal.";
}

export function doneSessionCopy(feel: string) {
  if (feel === "too_hard") return "Logged. Next time we ease that session — pain or grinding is not the point.";
  if (feel === "easy") return "Logged. If this keeps feeling easy we add a little load, not a whole new split.";
  return "Session logged. That is the work.";
}

export function extraStepsCard(steps: number, surplus: number, delayDays: number) {
  const delay =
    delayDays >= 0.2 ? ` Unpaid, this is about ${delayDays} day on the goal.` : "";
  return `About ${surplus} kcal above the plan. ${steps.toLocaleString()} extra steps today holds it.${delay}`;
}

export function weekCopy(
  decision: CoachWeekDecision,
  attendancePct: number | null,
  mealPct: number | null
) {
  const showUp = attendancePct == null ? "" : ` You made ${Math.round(attendancePct)}% of planned sessions.`;
  const meals = mealPct == null ? "" : ` Meals followed through ${Math.round(mealPct)}% of the time.`;

  switch (decision) {
    case "fix_schedule":
      return {
        headline: "The calendar is the problem, not the macros.",
        body: `Too many missed sessions this week.${showUp} We shorten the week you can keep, not invent a new split.`,
      };
    case "extra_steps":
      return {
        headline: "Follow-through is there. Scale and waist are quiet.",
        body: `After a few weeks of real adherence, the next honest move is more walking — not a smaller whole plan.${meals}`,
      };
    case "smaller_meal":
      return {
        headline: "One meal smaller. Not a new diet.",
        body: `You followed the plan. The body has been quiet. We trim one meal in the day, then we watch the next block.${meals}`,
      };
    case "eat_more":
      return {
        headline: "You look depleted. We do not cut.",
        body: `Low energy and a quiet logbook usually mean eat a bit more or take a lighter week — not a deeper deficit.`,
      };
    case "deload":
      return {
        headline: "Lighter week. Then the next block.",
        body: `Hard training needs a down week. Keep showing up easier. The goal is still on.`,
      };
    default:
      return {
        headline: "Hold. This is working.",
        body: `No drama.${showUp}${meals} We change a slot when it breaks — not the whole notebook.`,
      };
  }
}
