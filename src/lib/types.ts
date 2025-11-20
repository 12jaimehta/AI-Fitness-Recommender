import { type DietPlanFormData } from "@/lib/validation";

export interface FormInputProps {
  name?: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string | number | undefined;
  onChange?: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
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
  control?: any; // Control from react-hook-form
}

export interface GenderOption {
  value: string;
  label: string;
  image: string;
  description: string;
}

export interface GenderSelectorProps {
  selectedGender: string;
  onGenderSelect: (gender: string) => void;
  error?: string;
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

export interface ImprovedMealCardProps {
  mealType: string;
  mealData: MealData;
  isExpanded: boolean;
  onToggle: () => void;
  index: number;
  mealIcon: React.ReactElement;
  mealColor: string;
}

export interface NutritionCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  color: string;
  index: number;
}

export interface Step {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  description: string;
}

export interface ProgressBarProps {
  steps: Step[];
  currentStep: number;
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