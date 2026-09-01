import type { ExerciseLogEntry, WorkoutLogRow } from "@/shared/types/progress-tracking";

type MealLike = {
  total_calories: number;
  total_protein_g: number;
  source_type: string;
};
type WorkoutLike = Pick<
  WorkoutLogRow,
  "is_completed" | "exercises_completed" | "duration_minutes" | "calories_burned_estimated"
> | null;

export function workingSetsDone(exercises: ExerciseLogEntry[] | undefined) {
  if (!exercises?.length) return 0;
  return exercises.reduce(
    (count, exercise) =>
      count +
      (exercise.sets || []).filter((set) => set.kind !== "warmup" && Number(set.reps) > 0).length,
    0
  );
}

export function workoutTrained(workout: WorkoutLike) {
  if (!workout) return false;
  if (workout.is_completed) return true;
  return workingSetsDone(workout.exercises_completed) > 0;
}

export function summarizeTrackDay(meals: MealLike[], workout: WorkoutLike) {
  const calories = meals.reduce((sum, meal) => sum + Number(meal.total_calories || 0), 0);
  const protein_g = meals.reduce((sum, meal) => sum + Number(meal.total_protein_g || 0), 0);
  const meals_count = meals.length;
  const plan_meals_count = meals.filter((meal) => meal.source_type === "plan_checkoff").length;
  const trained = workoutTrained(workout);

  return {
    calories,
    protein_g,
    meals_count,
    plan_meals_count,
    diet_logged: meals_count > 0,
    workout_logged: trained,
    workouts: trained ? 1 : 0,
    workout_kcal: trained ? Number(workout?.calories_burned_estimated || 0) : 0,
    workout_minutes: trained ? Number(workout?.duration_minutes || 0) : 0,
    sets_completed: workingSetsDone(workout?.exercises_completed),
  };
}

export type TrackDaySummary = ReturnType<typeof summarizeTrackDay>;

export function trackDaysFromLogs(
  meals: (MealLike & { date: string })[],
  workouts: (NonNullable<WorkoutLike> & { date: string })[]
) {
  const mealsByDate = new Map<string, MealLike[]>();
  for (const row of meals) {
    if (!row.date) continue;
    const list = mealsByDate.get(row.date) || [];
    list.push(row);
    mealsByDate.set(row.date, list);
  }

  const workoutByDate = new Map<string, NonNullable<WorkoutLike>>();
  for (const row of workouts) {
    if (!row.date) continue;
    workoutByDate.set(row.date, row);
  }

  const days = new Map<string, TrackDaySummary>();
  for (const key of new Set([...mealsByDate.keys(), ...workoutByDate.keys()])) {
    days.set(key, summarizeTrackDay(mealsByDate.get(key) || [], workoutByDate.get(key) || null));
  }
  return days;
}
