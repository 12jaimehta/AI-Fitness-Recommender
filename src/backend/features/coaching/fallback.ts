import type { CoachingAdvice } from "@/shared/types/progress-tracking";
import { coerceProgramGoal, programGoalLabel } from "@/shared/lib/program-goals";
import type { CoachingContext } from "./retrieve";

function firstMeal(ctx: CoachingContext, slot: string) {
  return ctx.diet?.meals.find((meal) => meal.slot === slot)?.name;
}

export function fallbackCoachingAdvice(ctx: CoachingContext): CoachingAdvice {
  const goal = coerceProgramGoal(ctx.facts.diet_goal);
  const plateau = ctx.flags.includes("weight_loss_plateau");
  const staleDiet = ctx.flags.includes("stale_diet");
  const staleWorkout = ctx.flags.includes("stale_workout") || ctx.flags.includes("training_stagnation");
  const sportFuel = goal === "hyrox" || goal === "ironman" || goal === "running";
  const currentCals = ctx.diet?.calorieTarget || 2200;
  const breakfast = firstMeal(ctx, "breakfast");
  const lunch = firstMeal(ctx, "lunch");
  const dinner = firstMeal(ctx, "dinner");
  const preference = ctx.diet?.preference || "your current diet";

  if (!ctx.diet && !ctx.workout) {
    return {
      headline: "Save a diet and workout so we can coach from your real plan.",
      status: "learning",
      plateau: false,
      flags: [],
      reasons: ["No saved plans yet."],
      remembered: "No plan is stored yet.",
      diet: {
        should_change: false,
        summary: "Make a diet plan first. Then we track meals against it.",
        calorie_change: "hold",
        suggested_calories: null,
        protein_note: "Protein targets appear after you generate a diet.",
        meal_tweaks: [],
      },
      workout: {
        should_change: false,
        summary: "Make a workout plan first.",
        action: "Open workout and save a plan.",
      },
    };
  }

  if (!ctx.flags.length && ctx.weights.length < 3) {
    return {
      headline: "Keep logging weight and sessions. We need a few weeks to learn your pattern.",
      status: "learning",
      plateau: false,
      flags: [],
      reasons: ctx.reasons,
      remembered: `Goal is ${programGoalLabel(goal)}. Preference is ${preference}.`,
      diet: {
        should_change: false,
        summary: ctx.diet
          ? `Stay on ${ctx.diet.title} at ${ctx.diet.calorieTarget || "-"} kcal until we see a stall.`
          : "Save a diet plan.",
        calorie_change: "hold",
        suggested_calories: ctx.diet?.calorieTarget || null,
        protein_note: ctx.diet?.proteinTarget
          ? `Keep protein near ${ctx.diet.proteinTarget} g.`
          : "Log meals so we can check protein.",
        meal_tweaks: breakfast ? [`Keep ${breakfast} as breakfast unless hunger is high.`] : [],
      },
      workout: {
        should_change: false,
        summary: ctx.workout
          ? `Stay on ${ctx.workout.title} and log the sessions.`
          : "Save a workout plan.",
        action: "Log today's session on Progress.",
      },
    };
  }

  const bump = sportFuel || plateau || staleDiet;
  const suggested = bump ? Math.round(currentCals * (sportFuel ? 1.08 : 1.1)) : currentCals;
  const shouldChangeDiet = plateau || staleDiet;
  const status = plateau || staleDiet || staleWorkout ? (shouldChangeDiet ? "needs_new_plan" : "plateau") : "on_track";

  return {
    headline: plateau
      ? "Progress has stalled. Change the diet, don't just repeat the same calories."
      : staleWorkout
        ? "The workout has been the same too long. Progress the training."
        : staleDiet
          ? "This diet has been running long enough. Refresh it to match where you are now."
          : "You are still moving. Stay on the current plan and keep logging.",
    status: ctx.flags.length ? status : "on_track",
    plateau,
    flags: ctx.flags,
    reasons: ctx.reasons,
    remembered: `Goal ${programGoalLabel(goal)}, ${preference}, last weight ${ctx.facts.last_weight_kg ?? "unknown"} kg.`,
    diet: {
      should_change: shouldChangeDiet,
      summary: shouldChangeDiet
        ? sportFuel
          ? `Fuel ${programGoalLabel(goal)}. Raise food slightly instead of cutting more.`
          : `Raise calories about 10% from ${currentCals} kcal and keep ${preference} meals.`
        : `Hold ${currentCals} kcal on ${ctx.diet?.title || "the current diet"}.`,
      calorie_change: bump && shouldChangeDiet ? "increase" : "hold",
      suggested_calories: shouldChangeDiet ? suggested : currentCals,
      protein_note: ctx.diet?.proteinTarget
        ? `Keep protein at ${ctx.diet.proteinTarget} g even if calories move.`
        : "Keep protein high at each meal.",
      meal_tweaks: [
        breakfast ? `Add protein to ${breakfast}.` : "Add protein at breakfast.",
        lunch || dinner
          ? `Keep ${lunch || dinner} filling; change portions before swapping the whole meal.`
          : "Change portions before inventing a new menu.",
      ],
    },
    workout: {
      should_change: staleWorkout,
      summary: staleWorkout
        ? "Same sessions for 6+ weeks. Change volume, rest, or the split."
        : "Keep the current split and log working sets.",
      action: staleWorkout ? "Make a new workout plan." : "Log sets so we can see if loads are stuck.",
    },
  };
}
