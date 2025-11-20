// Shared components
export * from './shared';

// Diet components
export * from './diet';

// Workout components
export * from './workout';

// Types - re-export from centralized types file
export type { DietPlanData, DailyMeals, MealData } from '../lib/types';
export type { WorkoutPlanData, DailyWorkout, Exercise } from '../lib/ai-service';
