import type { DietTrack, TrackInsight, TrackKind, TrackingContext, WorkoutTrack } from "@/shared/types";

export function fallbackProgressInsights(
  track: TrackKind,
  snapshot: DietTrack | WorkoutTrack,
  tracking: TrackingContext
): TrackInsight[] {
  if (track === "diet") {
    const diet = snapshot as DietTrack;
    if (!tracking.diet.hasPlan) {
      return [
        {
          title: "Save a diet plan",
          message: "Generate and save a diet plan. Tracking then uses those meals for the day.",
          type: "info",
        },
      ];
    }
    if (tracking.diet.loggedCount <= 0) {
      const first = tracking.diet.meals[0];
      return [
        {
          title: "Log today's meals",
          message: first
            ? `Start with ${first.label.toLowerCase()}: ${first.name}.`
            : "Tap a meal from your plan to log it.",
          type: "info",
        },
      ];
    }
    if (tracking.diet.loggedCount >= tracking.diet.mealsPerDay) {
      return [
        {
          title: "All meals logged",
          message: `${tracking.diet.loggedCount}/${tracking.diet.mealsPerDay} meals · ${tracking.diet.todayCalories} kcal today.`,
          type: "success",
        },
      ];
    }
    if (diet.today.calories > (tracking.diet.calorieTarget || diet.target)) {
      return [
        {
          title: "Over target",
          message: `${tracking.diet.todayCalories} kcal logged vs ${tracking.diet.calorieTarget || diet.target} kcal on your plan.`,
          type: "warning",
        },
      ];
    }
    return [
      {
        title: "Keep going",
        message: `${tracking.diet.loggedCount} of ${tracking.diet.mealsPerDay} meals logged · ${tracking.diet.todayCalories} kcal.`,
        type: "success",
      },
    ];
  }

  const workout = snapshot as WorkoutTrack;
  if (!tracking.workout.hasPlan) {
    return [
      {
        title: "Save a workout plan",
        message: "Generate and save a workout plan. Tracking then uses those sessions.",
        type: "info",
      },
    ];
  }
  if (tracking.workout.isRestDay && tracking.workout.loggedToday.length === 0) {
    return [
      {
        title: "Rest day",
        message: "Today is rest on your plan. Log a training day if you still trained.",
        type: "info",
      },
    ];
  }
  if (workout.totals.sessions <= 0 && tracking.workout.loggedToday.length === 0) {
    const today = tracking.workout.sessions.find((session) => session.isToday && !session.isRest);
    return [
      {
        title: "Log today's session",
        message: today
          ? `Your plan: ${today.label} · ${today.durationMinutes} min.`
          : "Tap a session from your plan to log it.",
        type: "info",
      },
    ];
  }
  return [
    {
      title: "Plan adherence",
      message: `${tracking.workout.sessionsThisWeek} of ${tracking.workout.frequency || 0} sessions this week · ${workout.totals.calories} kcal this period.`,
      type: "success",
    },
  ];
}
