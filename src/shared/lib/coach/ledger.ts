export const KCAL_PER_STEP = 0.045;
export const MIN_MEAL_KCAL = 200;
export const DEFAULT_FAT_LOSS_DEFICIT = 500;
export const SURPLUS_IGNORE_UNDER = 40;
export const CALORIE_MIN = 1400;
export const CALORIE_MAX = 4500;
export const INTERVIEW_MAX_QUESTIONS = 3;

export function extraStepsForSurplus(surplusKcal: number) {
  if (surplusKcal <= SURPLUS_IGNORE_UNDER) return 0;
  const raw = surplusKcal / KCAL_PER_STEP;
  return Math.max(50, Math.round(raw / 50) * 50);
}

export function kcalFromSteps(steps: number) {
  return Math.round(Math.max(0, steps) * KCAL_PER_STEP);
}

export function unpaidSurplus(surplusKcal: number, stepsTarget: number, stepsDone: number) {
  if (surplusKcal <= 0) return 0;
  if (stepsTarget <= 0) return surplusKcal;
  return Math.max(0, surplusKcal - kcalFromSteps(Math.min(stepsDone, stepsTarget)));
}

export function goalDelayDays(unpaidKcal: number, dailyDeficit = DEFAULT_FAT_LOSS_DEFICIT) {
  if (unpaidKcal <= 0 || dailyDeficit <= 0) return 0;
  return Math.round((unpaidKcal / dailyDeficit) * 10) / 10;
}

export function clampMealBudget(kcal: number) {
  return Math.max(MIN_MEAL_KCAL, Math.round(kcal));
}

export function midKcal(low: number, high: number) {
  return Math.round((Number(low) + Number(high)) / 2);
}

export function surplusVsBudget(actual: number, budget: number) {
  return Math.round(actual - budget);
}
