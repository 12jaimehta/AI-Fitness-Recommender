export type MealAlternative = {
  name: string;
  calories: number;
  description: string;
};

export type MealData = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientBreakdown: string | object;
  alternatives?: MealAlternative[];
};

export type DailyMeals = {
  breakfast?: MealData;
  lunch?: MealData;
  dinner?: MealData;
  snacks?: MealData;
  morningSnack?: MealData;
  eveningSnack?: MealData;
  afternoonSnack?: MealData;
  beforeBed?: MealData;
};

export type DietPlanData = {
  meals?: DailyMeals;
  weeklyPlan?: {
    monday: DailyMeals;
    tuesday: DailyMeals;
    wednesday: DailyMeals;
    thursday: DailyMeals;
    friday: DailyMeals;
    saturday: DailyMeals;
    sunday: DailyMeals;
  };
  nutritionTips: string[];
  calorieTarget: string;
  proteinTarget: string;
  carbTarget: string;
  fatTarget: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: number | string;
  weight?: string;
  duration?: string;
  rest: string;
  instructions: string;
  muscleGroup: string;
  difficulty: string;
  alternatives: { name: string; description: string }[];
};

export type DailyWorkout = {
  day: string;
  muscleGroups: string[];
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  estimatedCalories: string;
};

export type WorkoutPlanData = {
  weeklyPlan?: {
    monday: DailyWorkout;
    tuesday: DailyWorkout;
    wednesday: DailyWorkout;
    thursday: DailyWorkout;
    friday: DailyWorkout;
    saturday: DailyWorkout;
    sunday: DailyWorkout;
  };
  singleWorkout?: DailyWorkout;
  workoutTips: string[];
  estimatedCaloriesBurn: string;
  recommendedRestDays: string[];
  warmupRoutine: Exercise[];
  cooldownRoutine: Exercise[];
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  initial_weight: number | null;
  fitness_level: string | null;
  goals: string[] | null;
  calorie_target?: number | null;
  protein_target?: number | null;
  carb_target?: number | null;
  fat_target?: number | null;
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
};

export type WeightEntry = {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export type WorkoutEntry = {
  id: string;
  user_id: string;
  workout_type: string;
  duration_minutes: number;
  calories_burned: number;
  date: string;
  notes: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  deadline: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  icon_name: string;
  achieved_at: string;
};

export type LoggedMeal = {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type DailyNutrition = {
  id: string;
  user_id: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  meals?: Record<string, LoggedMeal> | null;
  created_at: string;
};

export type TrackMealOption = {
  slot: string;
  label: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  logged: boolean;
};

export type TrackWorkoutSession = {
  dayKey: string;
  label: string;
  muscleGroups: string[];
  durationMinutes: number;
  estimatedCalories: number;
  exercises: string[];
  isToday: boolean;
  isRest: boolean;
  logged: boolean;
};

export type TrackingDiet = {
  hasPlan: boolean;
  planId: string | null;
  title: string | null;
  mealsPerDay: number;
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  meals: TrackMealOption[];
  loggedCount: number;
  todayCalories: number;
};

export type TrackingWorkout = {
  hasPlan: boolean;
  planId: string | null;
  title: string | null;
  frequency: number;
  todayKey: string;
  isRestDay: boolean;
  sessions: TrackWorkoutSession[];
  loggedToday: string[];
  sessionsThisWeek: number;
  todayCalories: number;
};

export type TrackingContext = {
  date: string;
  diet: TrackingDiet;
  workout: TrackingWorkout;
};

export type TrackRange = "week" | "month" | "year" | "last_year";
export type TrackKind = "diet" | "workout";

export type ChartPoint = {
  label: string;
  value: number;
};

export type DietTrack = {
  range: TrackRange;
  from: string;
  to: string;
  unit: "kcal";
  target: number;
  points: ChartPoint[];
  today: { calories: number; protein: number; carbs: number; fats: number };
  totals: { calories: number; protein: number; carbs: number; fats: number };
  mealsPerDay: number;
  mealsLogged: number;
  planTitle: string | null;
};

export type WorkoutTrack = {
  range: TrackRange;
  from: string;
  to: string;
  unit: "kcal";
  points: ChartPoint[];
  today: { calories: number; minutes: number; sessions: number };
  totals: { calories: number; minutes: number; sessions: number };
  recent: {
    id: string;
    workout_type: string;
    duration_minutes: number;
    calories_burned: number;
    date: string;
  }[];
  frequency: number;
  sessionsThisWeek: number;
  planTitle: string | null;
};

export type TrackInsight = {
  title: string;
  message: string;
  type: "warning" | "success" | "info";
};

export type ProgressPhoto = {
  id: string;
  user_id: string;
  photo_url: string;
  date: string;
  weight: number | null;
  notes: string | null;
  created_at: string;
};

export type Creator = {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  category?: string | null;
  bio?: string | null;
  instagram_handle?: string | null;
};

export type Trainer = {
  id: string;
  full_name: string | null;
  bio?: string | null;
  expertise?: string[] | null;
  experience_years?: number | null;
  hourly_rate?: number | null;
  is_verified?: boolean;
  avatar_url?: string | null;
  instagram_handle?: string | null;
};

export type CreatorPlan = {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  price: number;
  duration_weeks: number | null;
  difficulty: string | null;
  cover_image: string | null;
};
