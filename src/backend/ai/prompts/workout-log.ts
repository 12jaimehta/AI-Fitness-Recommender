export function buildWorkoutLogPrompt(text: string) {
  return `Convert this unstructured workout description into structured JSON.

User said: "${text}"

JSON only:
{
  "title": string,
  "duration_minutes": number,
  "estimated_calories_burned": number,
  "exercises_completed": [{ "exercise_name": string, "sets_completed": number, "reps_done": string }]
}`;
}
