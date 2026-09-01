import type { DietPlanData, WorkoutPlanData } from "@/shared/types";
import type { CurrentPlans } from "@/shared/types/progress-tracking";
import { requireUser } from "@backend/shared/api/supabase";
import { parseIsoDate } from "@/shared/lib/plan-tracking";
import { mapDietPlan, mapWorkoutPlan } from "@/shared/lib/current-plans";
import { utcToday } from "./db";

type DietRow = {
  id: string;
  title: string;
  form_data: { mealsPerDay?: string | number };
  diet_plan: DietPlanData;
};

type WorkoutRow = {
  id: string;
  title: string;
  form_data: { workoutFrequency?: string | number; workoutDuration?: string | number };
  workout_plan: WorkoutPlanData;
};

export async function getCurrentPlans(dateInput?: string | null): Promise<CurrentPlans> {
  const { supabase, user } = await requireUser();
  const date = parseIsoDate(dateInput, utcToday());

  const [dietRes, workoutRes] = await Promise.all([
    supabase
      .from("diet_plans")
      .select("id, title, form_data, diet_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("workout_plans")
      .select("id, title, form_data, workout_plan")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const diet = (dietRes.data as DietRow | null) || null;
  const workout = (workoutRes.data as WorkoutRow | null) || null;

  return {
    diet_plan: diet ? mapDietPlan(diet, date) : null,
    workout_plan: workout ? mapWorkoutPlan(workout, date) : null,
  };
}
