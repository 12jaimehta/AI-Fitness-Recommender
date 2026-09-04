const BUTTER_KCAL: Record<string, number> = { less: -80, normal: 0, heavy: 140 };
const PORTION_MULT: Record<string, number> = { small: 0.7, one: 1, two: 1.85, more: 2.4 };
const SAUCE_KCAL: Record<string, number> = { none: 0, spoon: 40, more: 110 };
const DRINK_KCAL: Record<string, number> = { water: 0, chaas: 50, cola: 140, juice: 180 };

export function applyMealAdders(baseKcal: number, answers: Record<string, string>) {
  const portion = PORTION_MULT[answers.portion || "one"] ?? 1;
  const butter = BUTTER_KCAL[answers.butter] ?? 0;
  const sauce = SAUCE_KCAL[answers.sauce] ?? 0;
  const drink = DRINK_KCAL[answers.drink] ?? 0;
  return Math.max(80, Math.round(baseKcal * portion + butter + sauce + drink));
}

export function adderNote(answers: Record<string, string>) {
  const bits: string[] = [];
  if (answers.portion === "two") bits.push("two plates");
  if (answers.portion === "more") bits.push("a large portion");
  if (answers.butter === "heavy") bits.push("extra butter/oil");
  if (answers.sauce === "more") bits.push("extra sauce");
  if (answers.drink === "cola" || answers.drink === "juice") bits.push("a sweet drink");
  return bits.length ? bits.join(", ") : "";
}
