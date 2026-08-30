export const PROGRAM_GOALS = [
  "general_fitness",
  "fat_loss",
  "bodybuilding",
  "strength",
  "hyrox",
  "ironman",
  "running",
  "athletic",
] as const;

export type ProgramGoal = (typeof PROGRAM_GOALS)[number];

export const PROGRAM_GOAL_OPTIONS: { value: ProgramGoal; label: string }[] = [
  { value: "general_fitness", label: "General fitness" },
  { value: "fat_loss", label: "Fat loss" },
  { value: "bodybuilding", label: "Bodybuilding" },
  { value: "strength", label: "Strength" },
  { value: "hyrox", label: "Hyrox" },
  { value: "ironman", label: "Ironman / triathlon" },
  { value: "running", label: "Running" },
  { value: "athletic", label: "Sport / athletic" },
];

const LEGACY_GOAL: Record<string, ProgramGoal> = {
  muscle_gain: "bodybuilding",
  weight_loss: "fat_loss",
  weight_maintenance: "general_fitness",
  general_health: "general_fitness",
  endurance: "running",
  athletic_performance: "athletic",
};

export function coerceProgramGoal(value: unknown): ProgramGoal | undefined {
  if (typeof value !== "string" || !value) return undefined;
  if ((PROGRAM_GOALS as readonly string[]).includes(value)) return value as ProgramGoal;
  return LEGACY_GOAL[value];
}

export function programGoalLabel(goal?: string | null) {
  const coerced = coerceProgramGoal(goal);
  return PROGRAM_GOAL_OPTIONS.find((item) => item.value === coerced)?.label || "your goal";
}

export function dietActivityFromWorkoutDays(days: string) {
  const n = parseInt(days, 10);
  if (n >= 6) return "extremely_active" as const;
  if (n >= 5) return "very_active" as const;
  if (n >= 3) return "moderately_active" as const;
  if (n >= 1) return "lightly_active" as const;
  return "sedentary" as const;
}

export function dietFrequencyFromWorkoutDays(days: string) {
  const n = parseInt(days, 10);
  if (n >= 7) return "7" as const;
  if (n >= 5) return "5-6" as const;
  if (n >= 3) return "3-4" as const;
  if (n >= 1) return "1-2" as const;
  return "0" as const;
}

export function workoutPromptFocus(goal: ProgramGoal, muscles: string[]) {
  const muscleNote = muscles.length
    ? `Optional muscle bias: ${muscles.join(", ")}. Use only if it still fits the sport.`
    : "No muscle bias. Program the full goal.";

  const styles: Record<ProgramGoal, string> = {
    general_fitness: "Balanced full-body training. Mix strength and easy conditioning.",
    fat_loss: "Strength plus conditioning. Keep rest honest. Full-body or upper/lower.",
    bodybuilding: "Hypertrophy split across the week. Progressive overload. Cover all major muscle groups.",
    strength: "Compound lifts, lower reps, longer rest. Squat, hinge, press, pull.",
    hyrox: "Hyrox race work: running, sled, wall balls, farmer carry, burpee broad jumps, rowing, lunges. Mix engine and strength. Not a bodybuilding split.",
    ironman: "Triathlon endurance: bike/run (or gym bike/treadmill), swim or swim substitute, plus light strength. Not a bodybuilding split.",
    running: "Easy run, intervals, a long run, plus 1-2 strength sessions for injury prevention.",
    athletic: "Power, speed, and sport conditioning. Athletic movement, not a bodybuilding split.",
  };

  return `${styles[goal]}\n${muscleNote}`;
}

export function dietPromptFocus(goal: ProgramGoal) {
  const styles: Record<ProgramGoal, string> = {
    general_fitness: "Maintenance calories. Balanced plates. Protein at each meal.",
    fat_loss: "Calorie deficit. High protein. Keep carbs around training if they train.",
    bodybuilding: "High protein. Slight surplus. Carbs around lifting.",
    strength: "High protein. Enough carbs to lift heavy. Do not put them in a large deficit.",
    hyrox: "Fuel mixed racing. Higher carbs. Protein for recovery. Easy-to-digest meals near sessions.",
    ironman: "Endurance fueling. Higher carbs. Practice race-week eating. Protein for recovery.",
    running: "Carbs to support mileage. Protein for repair. Do not starve long-run days.",
    athletic: "Performance eating. Protein and carbs around training. Not a crash diet.",
  };
  return styles[goal];
}
