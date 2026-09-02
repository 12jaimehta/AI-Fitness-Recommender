import type { CoachingAdvice } from "@/shared/types/progress-tracking";
import { coerceProgramGoal, programGoalLabel } from "@/shared/lib/program-goals";
import type { CoachingContext } from "@backend/features/coaching/retrieve";

export function buildCoachingPrompt(ctx: CoachingContext) {
  const goal = programGoalLabel(ctx.facts.diet_goal);
  const notes = ctx.memory.notes
    .slice(-6)
    .map((note) => `- ${note.at.slice(0, 10)}: ${note.text}`)
    .join("\n");
  const previous = ctx.previousAdvice
    .map((row) => `- ${row.at.slice(0, 10)}: ${row.headline}`)
    .join("\n");
  const meals = (ctx.diet?.meals || [])
    .map((meal) => `${meal.slot}: ${meal.name} (${meal.calories})`)
    .join("; ");
  const weightLine = ctx.weights.length
    ? ctx.weights
        .slice(-8)
        .map((row) => `${row.date}:${row.kg}`)
        .join(", ")
    : "none";

  return `You are Fyte AI's long-term coach. You remember this user. Use the retrieved facts. Do not invent a plateau — flags are already computed.

Goal: ${goal}
Dietary preference: ${ctx.diet?.preference || "unknown"}
Start weight kg: ${ctx.facts.start_weight_kg ?? "unknown"}
Latest weight kg: ${ctx.facts.last_weight_kg ?? "unknown"} (${ctx.facts.last_weight_date || "n/a"})
Lowest weight kg: ${ctx.facts.lowest_weight_kg ?? "unknown"}
Recent weights: ${weightLine}

Diet plan: ${ctx.diet ? `${ctx.diet.title} · ${ctx.diet.ageDays ?? "?"} days old · ${ctx.diet.calorieTarget || "?"} kcal · ${ctx.diet.proteinTarget || "?"} g protein` : "none"}
Meals on the current plan: ${meals || "none"}
Calorie logging vs target (42 days): ${ctx.calorieAdherencePct ?? "n/a"}%
Protein logging vs target: ${ctx.proteinAdherencePct ?? "n/a"}%

Workout plan: ${ctx.workout ? `${ctx.workout.title} · ${ctx.workout.ageDays ?? "?"} days old · ${ctx.workout.frequency} days/week · ${ctx.workout.duration || "?"} · ${ctx.workout.equipment || "?"}` : "none"}
Sessions logged in 42 days: ${ctx.sessionsLast42Days}

Plateau flags (source of truth): ${ctx.flags.join(", ") || "none"}
Reasons: ${ctx.reasons.join(" ") || "none"}

What we already told them:
${previous || "none yet"}

What we remember:
${notes || "nothing stored yet"}

Rules:
- If flags are empty, plateau must be false. Do not claim a stall.
- If calorie_stall_14d: diet.should_change true. Cut about 200 kcal from the current target. Speak like a coach. Do not mention logs, forms, flags, or how the plan is generated.
- If weight_loss_plateau or stale_diet: diet.should_change true. Suggest a specific calorie move. Keep preference (${ctx.diet?.preference || "their diet"}).
- For hyrox, ironman, running: do not recommend a deeper calorie cut.
- If protein logging is well under target, say which meal to raise protein, using the current meal names.
- If stale_workout or training_stagnation: workout.should_change true.
- Suggested calories between 1400 and 4500. No medical claims. No supplements as the main fix.
- meal_tweaks: 2 short lines that name meals from the current plan.
- memory_note: one sentence we should store about this person.

Reply JSON only:
{
  "headline": string,
  "status": "learning" | "on_track" | "watch" | "plateau" | "needs_new_plan",
  "diet": {
    "should_change": boolean,
    "summary": string,
    "calorie_change": "increase" | "decrease" | "hold",
    "suggested_calories": number | null,
    "protein_note": string,
    "meal_tweaks": [string]
  },
  "workout": {
    "should_change": boolean,
    "summary": string,
    "action": string
  },
  "memory_note": string
}`;
}

export function coerceCalorieChange(
  value: unknown,
  goal: string | null
): CoachingAdvice["diet"]["calorie_change"] {
  const change = value === "increase" || value === "decrease" || value === "hold" ? value : "hold";
  const sport = coerceProgramGoal(goal);
  if ((sport === "hyrox" || sport === "ironman" || sport === "running") && change === "decrease") {
    return "hold";
  }
  return change;
}
