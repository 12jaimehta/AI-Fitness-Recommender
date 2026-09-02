import { resolveAuth } from "@backend/shared/api/supabase";
import { weekStartMonday } from "@/shared/lib/plan-tracking";
import { trackDaysFromLogs } from "@/shared/lib/daily-track";
import type { ExerciseLogEntry, WeeklyReview } from "@/shared/types/progress-tracking";
import { civilDate, utcToday } from "./db";
import { getCurrentPlans } from "./current-plans";

export async function getWeeklyReview(): Promise<WeeklyReview> {
  const resolved = await resolveAuth();
  const { supabase, user } = resolved;
  const today = utcToday();
  const from = weekStartMonday(today);
  const [mealsRes, workoutsRes, plans] = await Promise.all([
    supabase
      .from("meal_logs")
      .select("date, total_calories, total_protein_g, source_type")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", today),
    supabase
      .from("workout_logs")
      .select("date, is_completed, exercises_completed, duration_minutes, calories_burned_estimated")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", today),
    getCurrentPlans(today, resolved),
  ]);

  const days = [
    ...trackDaysFromLogs(
      (mealsRes.data || [])
        .map((row) => ({
          date: civilDate(row.date),
          total_calories: Number(row.total_calories || 0),
          total_protein_g: Number(row.total_protein_g || 0),
          source_type: String(row.source_type || ""),
        }))
        .filter((row) => row.date),
      (workoutsRes.data || [])
        .map((row) => ({
          date: civilDate(row.date),
          is_completed: Boolean(row.is_completed),
          exercises_completed: Array.isArray(row.exercises_completed)
            ? (row.exercises_completed as ExerciseLogEntry[])
            : [],
          duration_minutes: Number(row.duration_minutes || 0),
          calories_burned_estimated:
            row.calories_burned_estimated == null ? null : Number(row.calories_burned_estimated),
        }))
        .filter((row) => row.date)
    ).values(),
  ];
  const mealsLogged = days.reduce((sum, day) => sum + day.meals_count, 0);
  const trainedDays = days.filter((day) => day.workout_logged).length;
  const daysWithMeals = days.filter((day) => day.diet_logged).length;
  const targetFreq = plans.workout_plan?.weekly_frequency || 4;
  const adherence = Math.round(
    ((daysWithMeals / 7 + Math.min(trainedDays / Math.max(targetFreq, 1), 1)) / 2) * 100
  );

  return {
    week_period: `${from} to ${today}`,
    adherence_score: adherence,
    status: adherence >= 80 ? "on_track" : adherence >= 50 ? "slight_stall" : "needs_adjustment",
    ai_headline:
      trainedDays || mealsLogged
        ? `${trainedDays} workouts and ${mealsLogged} meals logged this week.`
        : "Log meals and workouts to get a weekly review.",
    insights: [
      plans.diet_plan
        ? `${daysWithMeals} days with meals logged.`
        : "Save a diet plan to track meals, or log meals with text.",
      plans.workout_plan
        ? `${trainedDays} of ${targetFreq} planned sessions.`
        : "Save a workout plan to track sessions, or tap Mark trained.",
    ],
    recommendations_for_plans: {
      diet_adjustment: "Keep logging the meals on your plan. Use AI log when you eat something else.",
      workout_adjustment: "Log working sets on your main lifts so next week's plan can progress.",
    },
  };
}
