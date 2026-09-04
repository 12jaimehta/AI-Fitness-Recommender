import { type DietPlanFormData } from "@/lib/validation/dietPlanSchema";
import type { ReactNode } from "react";

export interface FormInputProps {
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | number | undefined;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  labelExtra?: ReactNode;
  control?: any; // Control from react-hook-form
}

export interface FormSelectProps {
  name?: string;
  label: string;
  value?: string | undefined;
  onChange?: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  hint?: string;
  columns?: 1 | 2 | 3;
  compact?: boolean;
  variant?: "chips" | "dropdown";
  control?: any; // Control from react-hook-form
}

export interface MealAlternative {
  name: string;
  calories: number;
  description: string;
}

export interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientBreakdown: string | object;
  alternatives?: MealAlternative[];
}

export interface Step {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  description: string;
}

export interface DietPlanData {
  meals?: {
    breakfast?: MealData;
    lunch?: MealData;
    dinner?: MealData;
    snacks?: MealData;
    morningSnack?: MealData;
    eveningSnack?: MealData;
    afternoonSnack?: MealData;
  };
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
}

export interface DailyMeals {
  breakfast?: MealData;
  lunch?: MealData;
  dinner?: MealData;
  snacks?: MealData;
  morningSnack?: MealData;
  eveningSnack?: MealData;
  afternoonSnack?: MealData;
}

export interface RefactoredMultiStepFormProps {
  onSubmit: (data: DietPlanFormData) => void;
  loading: boolean;
}
