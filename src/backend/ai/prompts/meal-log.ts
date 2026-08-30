export function buildMealLogPrompt(text: string) {
  return `Convert this meal description into structured nutrition estimates.

User said: "${text}"

Rules:
- Realistic home-cooked and restaurant portions.
- Indian / regional foods use authentic typical recipes.
- If quantity is missing, assume one adult serving.
- JSON only:
{
  "meal_name": string,
  "items": [{ "name": string, "portion": string, "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number }],
  "total_calories": number,
  "total_protein_g": number,
  "total_carbs_g": number,
  "total_fat_g": number,
  "confidence_score": number,
  "ai_explanation": string
}`;
}
