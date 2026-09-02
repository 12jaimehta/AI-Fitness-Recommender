export type MealSourceType = "plan_checkoff" | "ai_text" | "ai_vision" | "manual";
export type WorkoutSourceType = "plan_checkoff" | "ai_text" | "manual";
export type WorkoutSetKind = "warmup" | "working" | "special";

export type PlannedFoodItem = {
  name: string;
  portion: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type CurrentPlanMeal = {
  meal_id: string;
  meal_name: string;
  slot: string;
  recommended_time: string;
  items: PlannedFoodItem[];
  total_meal_calories: number;
  total_meal_protein: number;
};

export type CurrentDietPlan = {
  id: string;
  plan_name: string;
  target_calories: number;
  target_protein_g: number;
  target_carbs_g: number;
  target_fat_g: number;
  target_water_ml: number;
  meals: CurrentPlanMeal[];
};

export type CurrentPlanExercise = {
  exercise_id: string;
  name: string;
  target_sets: number;
  target_reps: string;
  rest_seconds: number;
  muscle_group: string;
  suggested_weight: string;
};

export type CurrentTodayWorkout = {
  workout_id: string;
  day_of_week: string;
  focus_area: string;
  is_rest_day: boolean;
  estimated_duration_min: number;
  estimated_calories: number;
  exercises: CurrentPlanExercise[];
};

export type CurrentWorkoutPlan = {
  id: string;
  split_name: string;
  weekly_frequency: number;
  today_workout: CurrentTodayWorkout;
};

export type CurrentPlans = {
  diet_plan: CurrentDietPlan | null;
  workout_plan: CurrentWorkoutPlan | null;
};

export type MealLogRow = {
  id: string;
  date: string;
  meal_slot: string;
  source_type: MealSourceType;
  meal_name: string;
  items: PlannedFoodItem[];
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  is_plan_compliant: boolean;
  ai_explanation: string | null;
};

export type WorkoutSetEntry = {
  id: string;
  kind: WorkoutSetKind;
  weight_kg: number;
  reps: number;
};

export type ExerciseLogEntry = {
  exercise_id: string;
  exercise_name: string;
  target_sets: number;
  target_reps: string;
  muscle_group: string;
  sets: WorkoutSetEntry[];
};

export type WorkoutLogRow = {
  id: string;
  date: string;
  workout_plan_id: string | null;
  source_type: WorkoutSourceType;
  title: string;
  duration_minutes: number;
  rpe_rating: number | null;
  calories_burned_estimated: number | null;
  exercises_completed: ExerciseLogEntry[];
  is_completed: boolean;
  notes: string | null;
};

export type DailyVitals = {
  weight_kg: number | null;
  water_intake_ml: number;
  sleep_hours: number | null;
  energy_rating: number | null;
  mood_rating: number | null;
};

export type DailyProgress = {
  date: string;
  diet_plan: CurrentDietPlan | null;
  workout_plan: CurrentWorkoutPlan | null;
  targets: {
    calories: number;
    protein_g: number;
    water_ml: number;
    is_workout_day: boolean;
    workout_focus: string;
  };
  actuals: {
    total_calories: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fat_g: number;
    water_intake_ml: number;
    weight_kg: number | null;
    sleep_hours: number | null;
    energy_rating: number | null;
    workout_completed: boolean;
    meals_logged: MealLogRow[];
    workout_log: WorkoutLogRow | null;
  };
  adherence_score_pct: number;
};

export type AnalyticsPoint = {
  date: string;
  label: string;
  calories: number;
  protein_g: number;
  workouts: number;
  workout_kcal: number;
  diet_days: number;
  workout_days: number;
};

export type ProgressAnalytics = {
  range: string;
  from: string;
  to: string;
  bucket: "day" | "month";
  summary: {
    streak_days: number;
    avg_adherence_pct: number;
    total_workouts_completed: number;
    meals_logged: number;
    diet_days: number;
    plan_days: number;
    workout_days: number;
    days_in_range: number;
    total_calories: number;
    total_protein_g: number;
  };
  points: AnalyticsPoint[];
};

export type WeeklyReview = {
  week_period: string;
  adherence_score: number;
  status: "on_track" | "slight_stall" | "needs_adjustment" | "surpassing_target";
  ai_headline: string;
  insights: string[];
  recommendations_for_plans: {
    diet_adjustment: string;
    workout_adjustment: string;
  };
};

export type PlateauFlag =
  | "weight_loss_plateau"
  | "calorie_stall_14d"
  | "stale_diet"
  | "stale_workout"
  | "training_stagnation";

export type CoachingStatus = "learning" | "on_track" | "watch" | "plateau" | "needs_new_plan";

export type CoachingAdvice = {
  headline: string;
  status: CoachingStatus;
  plateau: boolean;
  flags: PlateauFlag[];
  reasons: string[];
  remembered: string;
  diet: {
    should_change: boolean;
    summary: string;
    calorie_change: "increase" | "decrease" | "hold";
    suggested_calories: number | null;
    protein_note: string;
    meal_tweaks: string[];
  };
  workout: {
    should_change: boolean;
    summary: string;
    action: string;
  };
};
