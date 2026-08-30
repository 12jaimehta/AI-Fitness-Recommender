export {
  generateAIDietPlan,
  saveDietPlan,
  getUserDietPlans,
  deleteDietPlan,
  storeGeneratedDietPlan,
  readGeneratedDietPlan,
  loadCurrentDietPlan,
  type DietPlanData,
  type MealData,
  type DailyMeals,
  type SavedDietPlan,
  type GeneratedDietSession,
} from "@frontend/features/diet-plan";

export {
  generateAIWorkoutPlan,
  saveWorkoutPlan,
  getUserWorkoutPlans,
  deleteWorkoutPlan,
  type WorkoutPlanData,
  type DailyWorkout,
  type Exercise,
  type SavedWorkoutPlan,
} from "@frontend/features/workout-plan";
