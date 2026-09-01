import type { DietTrack, TrackKind, TrackingContext, WorkoutTrack } from "@/shared/types";

export function buildProgressInsightsPrompt(
  track: TrackKind,
  snapshot: DietTrack | WorkoutTrack,
  tracking: TrackingContext
) {
  const period =
    snapshot.range === "week"
      ? "this week"
      : snapshot.range === "month"
        ? "this month"
        : snapshot.range === "year"
          ? "this year"
          : "last year";

  if (track === "diet") {
    const diet = snapshot as DietTrack;
    const plan = tracking.diet;
    const mealLines = plan.meals
      .map((meal) => `${meal.label}: ${meal.name} (${meal.calories} kcal) ${meal.logged ? "logged" : "not logged"}`)
      .join("; ");

    return `You are a concise nutrition coach for a fitness tracking app.
The user follows a saved AI diet plan. Tracking is meal-by-meal against that plan, not free-form calories.

Period: ${period} (${diet.from} to ${diet.to})
Plan: ${plan.hasPlan ? `${plan.title} · ${plan.mealsPerDay} meals/day` : "no saved diet plan"}
Today logged: ${plan.loggedCount}/${plan.mealsPerDay || 0} meals · ${plan.todayCalories} kcal
Daily calorie target from plan: ${plan.calorieTarget || diet.target}
Today macros: ${diet.today.calories} kcal, ${diet.today.protein}g protein, ${diet.today.carbs}g carbs, ${diet.today.fats}g fats
Today's planned meals: ${mealLines || "none"}
Period totals: ${diet.totals.calories} kcal, ${diet.totals.protein}g protein
Daily calories: ${JSON.stringify(diet.points)}

Reply with JSON only:
{ "insights": [ { "title": string, "message": string, "type": "info" | "success" | "warning" } ] }

Give 1 or 2 short insights about plan adherence. Be specific with the numbers. No medical claims.`;
  }

  const workout = snapshot as WorkoutTrack;
  const plan = tracking.workout;
  const sessionLines = plan.sessions
    .filter((session) => !session.isRest)
    .map((session) => `${session.label}${session.isToday ? " (today)" : ""}${session.logged ? " logged" : ""}`)
    .join("; ");

  return `You are a concise fitness coach.
The user follows a saved AI workout plan. Tracking is logging those planned sessions.

Period: ${period} (${workout.from} to ${workout.to})
Plan: ${plan.hasPlan ? `${plan.title} · ${plan.frequency} days/week` : "no saved workout plan"}
Today: ${plan.isRestDay ? "rest day on the plan" : plan.sessions.find((s) => s.isToday)?.label || "session"} · logged ${plan.loggedToday.length} session(s)
This week: ${plan.sessionsThisWeek}/${plan.frequency || 0} planned days
Period totals: ${workout.totals.sessions} sessions, ${workout.totals.minutes} min, ${workout.totals.calories} kcal
Planned sessions: ${sessionLines || "none"}
Daily calories burned: ${JSON.stringify(workout.points)}

Reply with JSON only:
{ "insights": [ { "title": string, "message": string, "type": "info" | "success" | "warning" } ] }

Give 1 or 2 short insights about following the workout plan. Be specific. No medical claims.`;
}
