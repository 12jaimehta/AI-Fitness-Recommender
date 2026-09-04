import type { CoachQuestion } from "@/shared/types/coach";
import { INTERVIEW_MAX_QUESTIONS } from "./ledger";

const PORTION: CoachQuestion = {
  id: "portion",
  prompt: "How much did you have?",
  options: [
    { value: "small", label: "Less than a plate" },
    { value: "one", label: "1 plate / serving" },
    { value: "two", label: "2 plates" },
    { value: "more", label: "More than 2" },
  ],
};

const BUTTER: CoachQuestion = {
  id: "butter",
  prompt: "How much butter or oil?",
  options: [
    { value: "less", label: "Less / dry" },
    { value: "normal", label: "Normal" },
    { value: "heavy", label: "Heavy / extra" },
  ],
};

const SAUCE: CoachQuestion = {
  id: "sauce",
  prompt: "Sauce, chutney, or ketchup?",
  options: [
    { value: "none", label: "None" },
    { value: "spoon", label: "About 1 spoon" },
    { value: "more", label: "More than that" },
  ],
};

const DRINK: CoachQuestion = {
  id: "drink",
  prompt: "Did you drink anything with it?",
  options: [
    { value: "water", label: "Water / black tea" },
    { value: "chaas", label: "Chaas / buttermilk" },
    { value: "cola", label: "Cola / sweet drink" },
    { value: "juice", label: "Juice / shake" },
  ],
};

const UNKNOWN_QUESTIONS: Record<string, CoachQuestion> = {
  portion: PORTION,
  butter: BUTTER,
  oil: BUTTER,
  sauce: SAUCE,
  drink: DRINK,
};

export const DISLIKE_QUESTIONS: CoachQuestion[] = [
  {
    id: "why",
    prompt: "What isn't working about this meal?",
    options: [
      { value: "boring", label: "I'm bored of it" },
      { value: "hate_food", label: "I don't like this food" },
      { value: "cant_cook", label: "I can't cook this" },
      { value: "too_heavy", label: "It's too heavy" },
      { value: "eating_out", label: "I'm eating out" },
    ],
  },
  {
    id: "instead",
    prompt: "What would you rather have?",
    options: [
      { value: "same_style", label: "Same style, different dish" },
      { value: "lighter", label: "Something lighter" },
      { value: "quicker", label: "Something quicker" },
      { value: "leftover", label: "Leftovers / simple" },
      { value: "tell_us", label: "I'll type it" },
    ],
  },
];

export const SESSION_DISLIKE_QUESTIONS: CoachQuestion[] = [
  {
    id: "why",
    prompt: "What's in the way today?",
    options: [
      { value: "no_time", label: "Not enough time" },
      { value: "tired", label: "Too tired" },
      { value: "sore", label: "Sore / niggle" },
      { value: "no_gear", label: "No equipment" },
      { value: "hate", label: "I don't like this session" },
    ],
  },
  {
    id: "minutes",
    prompt: "How long do you have?",
    options: [
      { value: "15", label: "15 minutes" },
      { value: "30", label: "30 minutes" },
      { value: "45", label: "45 minutes" },
    ],
  },
];

export const FEEL_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "right", label: "Just right" },
  { value: "too_hard", label: "Too hard" },
];

export const ENERGY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "ok", label: "Okay" },
  { value: "high", label: "High" },
];

export function questionsForUnknowns(unknowns: string[], already: Record<string, string> = {}) {
  const seen = new Set<string>();
  const picked: CoachQuestion[] = [];
  for (const raw of unknowns) {
    const key = raw.trim().toLowerCase();
    const question = UNKNOWN_QUESTIONS[key];
    if (!question || seen.has(question.id) || already[question.id]) continue;
    seen.add(question.id);
    picked.push(question);
    if (picked.length >= INTERVIEW_MAX_QUESTIONS) break;
  }
  if (!picked.length && !already.portion) picked.push(PORTION);
  return picked.slice(0, INTERVIEW_MAX_QUESTIONS);
}

export function remainingQuestions(
  all: CoachQuestion[],
  answers: Record<string, string>
): CoachQuestion | null {
  return all.find((question) => !answers[question.id]) || null;
}
