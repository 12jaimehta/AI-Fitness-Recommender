import { requireUser } from "@backend/shared/api/supabase";
import { weekStartMonday } from "@/shared/lib/plan-tracking";
import type { WeeklyReview } from "@/shared/types/progress-tracking";
import { utcToday } from "./db";
import { getCurrentPlans } from "./current-plans";

export async function getWeeklyReview(): Promise<WeeklyReview> {
  const { supabase, user } = await requireUser();
  const today = utcToday();
  const from = weekStartMonday(today);
  const [mealsRes, workoutsRes, plans] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("date, total_calories, total_protein_g")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", today),
    supabase
      .from("workout_logs")
      .select("date, is_completed, title")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", today),
    getCurrentPlans(today),
  ]);

  const meals = mealsRes.data || [];
  const workouts = (workoutsRes.data || []).filter((row) => row.is_completed);
  const daysWithMeals = new Set(meals.map((row) => String(row.date).slice(0, 10))).size;
  const targetFreq = plans.workout_plan?.weekly_frequency || 4;
  const adherence = Math.round(
    ((daysWithMeals / 7 + Math.min(workouts.length / Math.max(targetFreq, 1), 1)) / 2) * 100
  );

  return {
    week_period: `${from} to ${today}`,
    adherence_score: adherence,
    status: adherence >= 80 ? "on_track" : adherence >= 50 ? "slight_stall" : "needs_adjustment",
    ai_headline:
      workouts.length || meals.length
        ? `${workouts.length} workouts and ${meals.length} meals logged this week.`
        : "Log meals and workouts from your plan to get a weekly review.",
    insights: [
      plans.diet_plan
        ? `${daysWithMeals} days with meals logged.`
        : "Save a diet plan to track meals.",
      plans.workout_plan
        ? `${workouts.length} of ${targetFreq} planned sessions.`
        : "Save a workout plan to track sessions.",
    ],
    recommendations_for_plans: {
      diet_adjustment: "Keep logging the meals on your plan. Use AI log when you eat something else.",
      workout_adjustment: "Log working sets on your main lifts so next week's plan can progress.",
    },
  };
}
