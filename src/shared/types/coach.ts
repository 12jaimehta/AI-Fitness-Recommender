export type CoachPhase = "onboarding" | "block" | "diet_break" | "maintenance";
export type CoachSlotKind = "meal" | "session";
export type CoachSlotStatus =
  | "planned"
  | "as_planned"
  | "replaced"
  | "ate_other"
  | "skipped"
  | "done";
export type CoachFeel = "easy" | "right" | "too_hard";
export type CoachEnergy = "low" | "ok" | "high";
export type CoachInterviewKind = "meal_other" | "meal_dislike" | "session_dislike";
export type CoachInterviewStatus = "open" | "answered" | "applied" | "abandoned";
export type CoachWeekDecision =
  | "hold"
  | "extra_steps"
  | "smaller_meal"
  | "eat_more"
  | "deload"
  | "fix_schedule";

export type CoachQuestion = {
  id: string;
  prompt: string;
  options: { value: string; label: string }[];
};

export type CoachMealDraft = {
  meal_name: string;
  category: string;
  kcal_low: number;
  kcal_high: number;
  protein_g: number;
  unknowns: string[];
  explanation: string;
};

export type CoachSwapOption = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredientBreakdown: string;
  description: string;
};

export type CoachSlotView = {
  id: string;
  kind: CoachSlotKind;
  slotKey: string;
  title: string;
  budgetKcal: number;
  budgetProteinG: number;
  status: CoachSlotStatus;
  actualKcal: number | null;
  actualProteinG: number | null;
  actualLabel: string | null;
  feel: CoachFeel | null;
  isRest?: boolean;
};

export type CoachInterviewView = {
  id: string;
  kind: CoachInterviewKind;
  slotId: string;
  slotKey: string;
  slotTitle: string;
  status: CoachInterviewStatus;
  questions: CoachQuestion[];
  answers: Record<string, string>;
  draft: CoachMealDraft | null;
  options: CoachSwapOption[];
  headline: string;
};

export type CoachDailyView = {
  plannedKcal: number;
  actualKcal: number;
  surplusKcal: number;
  extraStepsTarget: number;
  extraStepsDone: number;
  carryoverKcal: number;
  delayDays: number;
  weightKg: number | null;
  sleepHours: number | null;
  energy: CoachEnergy | null;
  mealsPlanned: number;
  mealsLogged: number;
  sessionPlanned: boolean;
  sessionDone: boolean;
};

export type CoachWeekReviewView = {
  weekStart: string;
  attendancePct: number | null;
  mealAdherencePct: number | null;
  weightAvgKg: number | null;
  weightDeltaKg: number | null;
  waistDeltaCm: number | null;
  decision: CoachWeekDecision;
  headline: string;
  body: string;
};

export type CoachToday = {
  date: string;
  setupRequired: boolean;
  setupMessage: string | null;
  hasDiet: boolean;
  hasWorkout: boolean;
  goal: string | null;
  targetKcal: number | null;
  headline: string;
  meals: CoachSlotView[];
  session: CoachSlotView | null;
  daily: CoachDailyView;
  openInterview: CoachInterviewView | null;
  review: CoachWeekReviewView | null;
};
