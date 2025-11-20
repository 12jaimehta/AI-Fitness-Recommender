import { NextResponse } from "next/server";
import OpenAI from "openai";
import { dietPlanSchema, type DietPlanFormData } from "@/lib/validation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    // Ensure JSON content-type
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type. Use application/json." },
        { status: 415 }
      );
    }

    const body = (await request.json()) as unknown;

    // Some clients may accidentally wrap payloads in markdown fences; attempt to recover
    // by stripping leading/trailing fences if the body was sent as a string.
    // This is defensive and won't run for proper JSON payloads.
    let requestData: unknown = body;
    if (typeof body === "string") {
      const cleaned = body
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      try {
        requestData = JSON.parse(cleaned);
      } catch {
        // Fall back to the original body (will fail validation below)
        requestData = body;
      }
    }

    // Validate input
    const result = dietPlanSchema.safeParse(requestData);
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userData = result.data as DietPlanFormData;

    // Calculate nutrition targets
    const weightInKg = userData.weightUnit === 'lbs' 
      ? parseFloat(userData.weight) * 0.453592 
      : parseFloat(userData.weight);
    
    const heightInCm = userData.heightUnit === 'ftin' 
      ? (parseFloat(userData.feet || '0') * 30.48) + (parseFloat(userData.inches || '0') * 2.54)
      : parseFloat(userData.height || '0');

    const age = parseInt(userData.age);
    const activity = userData.activityLevel;
    const goal = userData.goal;

    // Calculate BMR using Mifflin-St Jeor equation
    let bmr: number;
    if (userData.gender === 'male') {
      bmr = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age);
    }

    // Activity multiplier
    const activityMultipliers = {
      'sedentary': 1.2,
      'lightly_active': 1.375,
      'moderately_active': 1.55,
      'very_active': 1.725,
      'extremely_active': 1.9
    };

    let totalCalories = Math.round(bmr * activityMultipliers[activity]);

    // Adjust for goals
    if (goal === 'weight_loss') totalCalories -= 500;
    else if (goal === 'muscle_gain') totalCalories += 300;

    // Calculate macros
    const protein = Math.round(weightInKg * 1.6);
    const fat = Math.round(totalCalories * 0.25 / 9);
    const carbs = Math.round((totalCalories - (protein * 4) - (fat * 9)) / 4);

    const prompt = `
You are an expert nutritionist. Based on the following user data, generate a complete diet plan:
---
Age: ${userData.age}
Gender: ${userData.gender}
Weight: ${userData.weight} ${userData.weightUnit}
Height: ${userData.heightUnit === "ftin" ? `${userData.feet}'${userData.inches}"` : `${userData.height} cm`}
Goal: ${userData.goal}
Dietary Preference: ${userData.dietaryPreference}
Activity Level: ${userData.activityLevel}
Allergies: ${userData.allergies || "None"}
Medical Conditions: ${userData.medicalConditions || "None"}
Favorite Foods: ${userData.favoriteFoods || "None specified"}
Plan Type: Both Single Day and 7-Day Weekly Plan
Meals Per Day: ${userData.mealsPerDay} meals
Calorie Target: ${totalCalories} calories per day
Protein Target: ${protein}g per day
Carb Target: ${carbs}g per day
Fat Target: ${fat}g per day
---

Generate a personalized diet plan with the following structure:
Create BOTH a single day plan AND a 7-day weekly plan with different meals for each day to ensure variety and prevent boredom.
Each day should have ${userData.mealsPerDay} meals.

The single day plan will be used for the Daily View, and the weekly plan will be used for the Weekly View.

CRITICAL FOR WEEKLY PLAN: Each day must have DIFFERENT meals to ensure variety. No person should eat the same meal every day. For each meal in the weekly plan, provide 2-3 alternatives so users can switch between options while maintaining similar nutritional values.

${userData.favoriteFoods ? `
IMPORTANT: Try to incorporate these favorite foods into the meal plan: ${userData.favoriteFoods}
Make sure to include them in appropriate meals while maintaining nutritional balance.
` : ''}

Meal structure based on ${userData.mealsPerDay} meals per day:
${userData.mealsPerDay === "3" ? `
- Breakfast (around ${Math.round(totalCalories * 0.30)} calories)
- Lunch (around ${Math.round(totalCalories * 0.40)} calories)
- Dinner (around ${Math.round(totalCalories * 0.30)} calories)
` : userData.mealsPerDay === "4" ? `
- Breakfast (around ${Math.round(totalCalories * 0.25)} calories)
- Lunch (around ${Math.round(totalCalories * 0.35)} calories)
- Dinner (around ${Math.round(totalCalories * 0.30)} calories)
- Snacks (around ${Math.round(totalCalories * 0.10)} calories)
` : userData.mealsPerDay === "5" ? `
- Breakfast (around ${Math.round(totalCalories * 0.25)} calories)
- Morning Snack (around ${Math.round(totalCalories * 0.10)} calories)
- Lunch (around ${Math.round(totalCalories * 0.30)} calories)
- Evening Snack (around ${Math.round(totalCalories * 0.10)} calories)
- Dinner (around ${Math.round(totalCalories * 0.25)} calories)
` : `
- Breakfast (around ${Math.round(totalCalories * 0.20)} calories)
- Morning Snack (around ${Math.round(totalCalories * 0.10)} calories)
- Lunch (around ${Math.round(totalCalories * 0.30)} calories)
- Afternoon Snack (around ${Math.round(totalCalories * 0.10)} calories)
- Evening Snack (around ${Math.round(totalCalories * 0.10)} calories)
- Dinner (around ${Math.round(totalCalories * 0.20)} calories)
`}

IMPORTANT: For each meal, provide SPECIFIC QUANTITIES and measurements. Include exact portions like:
- "1 cup (200g) cooked quinoa"
- "150g grilled tofu"
- "2 tablespoons (30ml) olive oil"
- "1 medium banana (120g)"
- "100g mixed berries"
- "1 slice whole wheat bread (30g)"

CRITICAL: For each meal, also provide a detailed ingredient breakdown showing individual calories for each ingredient. This helps users understand exactly what they're eating and track their intake.

Example format:
"Main Meal: Tofu scramble with toast and avocado
Ingredients breakdown:
- 200g firm tofu: 180 calories
- 1 tbsp nutritional yeast: 20 calories  
- 1/4 tsp turmeric: 5 calories
- 2 slices whole grain toast (60g): 140 calories
- 1/2 avocado (70g): 110 calories
Total: 455 calories"

Provide the response in **strict JSON** matching this schema:
{
  "meals": {
    "breakfast": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },
    "lunch": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },
    "dinner": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },
    ${parseInt(userData.mealsPerDay) > 3 ? `"snacks": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },` : ''}
    ${parseInt(userData.mealsPerDay) > 4 ? `"morningSnack": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },
    "eveningSnack": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },` : ''}
    ${parseInt(userData.mealsPerDay) > 5 ? `"afternoonSnack": { 
      "name": "Detailed meal name with specific quantities", 
      "calories": number, 
      "protein": number, 
      "carbs": number, 
      "fat": number,
      "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories"
    },` : ''}
  },
  "weeklyPlan": {
    "monday": {
      "breakfast": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal 1 with specific quantities", "calories": number, "description": "Detailed description with measurements" }, { "name": "Alternative meal 2 with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "lunch": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "dinner": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      ${parseInt(userData.mealsPerDay) > 3 ? `"snacks": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
      ${parseInt(userData.mealsPerDay) > 4 ? `"morningSnack": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "eveningSnack": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
      ${parseInt(userData.mealsPerDay) > 5 ? `"afternoonSnack": { "name": "Detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
    },
    "tuesday": { 
      "breakfast": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "lunch": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "dinner": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      ${parseInt(userData.mealsPerDay) > 3 ? `"snacks": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
      ${parseInt(userData.mealsPerDay) > 4 ? `"morningSnack": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },
      "eveningSnack": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
      ${parseInt(userData.mealsPerDay) > 5 ? `"afternoonSnack": { "name": "Different detailed meal name with specific quantities", "calories": number, "protein": number, "carbs": number, "fat": number, "ingredientBreakdown": "Detailed breakdown of each ingredient with quantities and individual calories", "alternatives": [{ "name": "Alternative meal with specific quantities", "calories": number, "description": "Detailed description with measurements" }] },` : ''}
    },
    "wednesday": { ... similar structure with DIFFERENT meals than monday and tuesday ... },
    "thursday": { ... similar structure with DIFFERENT meals than previous days ... },
    "friday": { ... similar structure with DIFFERENT meals than previous days ... },
    "saturday": { ... similar structure with DIFFERENT meals than previous days ... },
    "sunday": { ... similar structure with DIFFERENT meals than previous days ... }
  },
  "nutritionTips": [string],
  "calorieTarget": string,
  "proteinTarget": string,
  "carbTarget": string,
  "fatTarget": string
}

Make sure all meals match the ${userData.dietaryPreference} dietary preference and consider the user's goal of ${userData.goal}.
CRITICAL: Include exact quantities, measurements, portion sizes, AND individual ingredient calorie breakdowns for all food items.
${userData.favoriteFoods ? `CRITICAL: Make sure to incorporate the user's favorite foods: ${userData.favoriteFoods}` : ''}
`;

    let dietPlan: any;
    try {
      console.log("Attempting to generate AI diet plan with prompt length:", prompt.length);
      console.log("User data:", {
        dietaryPreference: userData.dietaryPreference,
        goal: userData.goal,
        mealsPerDay: userData.mealsPerDay
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 8000, // Limit tokens to avoid rate limits
      });

      const jsonText = response.choices[0].message?.content || "{}";
      console.log("Raw AI response length:", jsonText.length);
      console.log("Raw AI response preview:", jsonText.substring(0, 200) + "...");
      
      // Clean up the response - remove any markdown code blocks
      const cleanedJson = jsonText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      console.log("Cleaned JSON length:", cleanedJson.length);
      dietPlan = JSON.parse(cleanedJson);
      console.log("AI Response parsed successfully:", {
        hasMeals: !!dietPlan.meals,
        hasWeeklyPlan: !!dietPlan.weeklyPlan,
        hasNutritionTips: !!dietPlan.nutritionTips,
        responseKeys: Object.keys(dietPlan)
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate diet plan";
      console.error("AI generation error:", err);
      console.error("Error details:", message);
      
      // Return proper error response instead of using fallback
      return NextResponse.json(
        {
          error: "Failed to generate diet plan",
          details: message,
        },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!dietPlan) {
      console.error("AI returned undefined diet plan");
      return NextResponse.json(
        {
          error: "Failed to generate diet plan",
          details: "AI returned invalid response",
        },
        { status: 500 }
      );
    }

    // Validate response structure - now we require both meals and weeklyPlan
    const isValidSingleDay = dietPlan.meals && dietPlan.nutritionTips;
    const isValidWeekly = dietPlan.weeklyPlan && dietPlan.nutritionTips;
    
    if (!isValidSingleDay || !isValidWeekly) {
      console.error("Invalid AI response structure:", {
        hasMeals: !!dietPlan.meals,
        hasWeeklyPlan: !!dietPlan.weeklyPlan,
        hasNutritionTips: !!dietPlan.nutritionTips,
        responseKeys: Object.keys(dietPlan)
      });
      console.log("Using fallback plan due to invalid structure - missing either meals or weeklyPlan");
      dietPlan = generateFallbackPlan(userData, totalCalories, protein, carbs, fat);
    }

    return NextResponse.json(dietPlan, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to generate diet plan";
    
    console.error("AI generation error:", err);
    
    // Check if it's a rate limit error - use fallback plan since we don't have access to user data here
    if (message.includes("429") || message.includes("rate limit")) {
      console.log("Rate limit detected - would use fallback plan if we had user data");
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again in a few minutes.",
          details: "OpenAI API rate limit reached. Please try again later.",
          rateLimited: true
        },
        { status: 429 }
      );
    }
    
    // If upstream sent a markdown-encoded payload that led to a parse error,
    // surface a clearer message.
    const isFenceError =
      typeof message === "string" &&
      message.toLowerCase().includes("unexpected token '`'");

    return NextResponse.json(
      {
        error: isFenceError
          ? "Invalid JSON payload. Remove markdown code fences (``` ... ```)."
          : "Failed to generate diet plan",
        details: message,
      },
      { status: 500 }
    );
  }
}

// Fallback meal plan generator in case AI fails
// Replaces the old generateFallbackPlan — uses meals from uploaded PDFs (Guru Mann)
function generateFallbackPlan(userData: DietPlanFormData, totalCalories: number, protein: number, carbs: number, fat: number) {
  // split calories the same way you had before
  const breakfastCalories = Math.round(totalCalories * 0.25);
  const lunchCalories = Math.round(totalCalories * 0.35);
  const dinnerCalories = Math.round(totalCalories * 0.30);
  const snacksCalories = Math.round(totalCalories * 0.10);

  console.log("generateFallbackPlan - using PDF-based meals, goal:", userData.goal, "dietaryPreference:", userData.dietaryPreference);

  // --- Meals from LEAN MODE (Guru Mann) — used for muscle/lean/maintenance goals. Source: LEAN_MODE PDF. :contentReference[oaicite:2]{index=2}
  const leanModeMeals = {
    breakfast: {
      name: "Protein smoothie: 2/3 scoop whey, 1/2 cup oats (40g), 1 banana (120g), 1 tsp peanut butter (5g), 240ml non-fat milk, 2g cinnamon",
      calories: 410,
      protein: 30,
      carbs: 50,
      fat: 10,
      ingredientBreakdown:
        `Ingredients breakdown:
- 2/3 scoop whey: 80 kcal (approx)
- 1/2 cup oats (40g): 150 kcal
- 1 medium banana (120g): 105 kcal
- 1 tsp peanut butter (5g): 30 kcal
- 240ml non-fat milk: 30 kcal
- 2g cinnamon: 0 kcal
Total: 410 kcal`
    },
    snack1: {
      // Different options based on dietary preference
      name: userData.dietaryPreference === "non-vegetarian"
        ? "Spinach omelette: 1 whole egg + 5 egg whites, 3 slices whole wheat bread, 2 handfuls spinach, 1 orange"
        : userData.dietaryPreference === "vegan"
        ? "Tofu scramble: 200g firm tofu + turmeric + nutritional yeast, 3 slices whole wheat bread, 2 handfuls spinach, 1 orange"
        : userData.dietaryPreference === "eggetarian"
        ? "Egg omelette: 3 whole eggs, 3 slices whole wheat bread, 2 handfuls spinach, 1 orange"
        : userData.dietaryPreference === "pescatarian"
        ? "Smoked salmon toast: 100g smoked salmon, 2 slices whole grain bread, 1 avocado, 1 orange"
        : "Milk & bread: 240ml non-fat milk (with 1 scoop Protinex optional), 3 slices whole wheat bread, 1 tsp peanut butter, 1 orange",
      calories: 410,
      protein: 30,
      carbs: 50,
      fat: 10,
      ingredientBreakdown: userData.dietaryPreference === "non-vegetarian"
        ? `Ingredients breakdown:
- 1 whole egg: 70 kcal
- 5 egg whites: 85 kcal
- 3 slices whole wheat bread: 150 kcal
- Spinach: ~15 kcal
- 1 orange: 60 kcal
Total: 410 kcal`
        : userData.dietaryPreference === "vegan"
        ? `Ingredients breakdown:
- 200g firm tofu: 180 kcal
- 1 tbsp nutritional yeast: 20 kcal
- 1/4 tsp turmeric: 5 kcal
- 3 slices whole wheat bread: 150 kcal
- Spinach: ~15 kcal
- 1 orange: 60 kcal
Total: 410 kcal`
        : userData.dietaryPreference === "eggetarian"
        ? `Ingredients breakdown:
- 3 whole eggs: 210 kcal
- 3 slices whole wheat bread: 150 kcal
- Spinach: ~15 kcal
- 1 orange: 60 kcal
Total: 410 kcal`
        : userData.dietaryPreference === "pescatarian"
        ? `Ingredients breakdown:
- 100g smoked salmon: 180 kcal
- 2 slices whole grain bread: 140 kcal
- 1/2 avocado: 80 kcal
- 1 orange: 60 kcal
Total: 410 kcal`
        : `Ingredients breakdown:
- 240ml non-fat milk: 90 kcal
- 1 scoop Protinex (optional): 120 kcal
- 3 slices whole wheat bread: 150 kcal
- 1 tsp peanut butter: 30 kcal
- 1 orange: 60 kcal
Total: 410 kcal`
    },
    lunch: {
      name: userData.dietaryPreference === "non-vegetarian"
        ? "Grilled chicken breast (150g) + brown rice (1 cup cooked) + steamed vegetables + green salad"
        : userData.dietaryPreference === "vegan"
        ? "Chickpea curry (1.5 cups) + brown rice (1 cup cooked) + steamed vegetables + green salad"
        : userData.dietaryPreference === "eggetarian"
        ? "Egg curry (2 eggs) + brown rice (1 cup cooked) + steamed vegetables + green salad"
        : userData.dietaryPreference === "pescatarian"
        ? "Grilled salmon (150g) + brown rice (1 cup cooked) + steamed vegetables + green salad"
        : "Tofu stir-fry (200g) + quinoa (1 cup cooked) + steamed vegetables + green salad",
      calories: 580,
      protein: 40,
      carbs: 60,
      fat: 12,
      ingredientBreakdown: userData.dietaryPreference === "non-vegetarian"
        ? `Ingredients breakdown:
- 150g grilled chicken breast: 250 kcal
- 1 cup brown rice: 215 kcal
- Steamed vegetables: 50 kcal
- Green salad with light dressing: 65 kcal
Total: 580 kcal`
        : userData.dietaryPreference === "vegan"
        ? `Ingredients breakdown:
- 1.5 cups chickpea curry: 250 kcal
- 1 cup brown rice: 215 kcal
- Steamed vegetables: 50 kcal
- Green salad with light dressing: 65 kcal
Total: 580 kcal`
        : userData.dietaryPreference === "eggetarian"
        ? `Ingredients breakdown:
- 2 egg curry: 200 kcal
- 1 cup brown rice: 215 kcal
- Steamed vegetables: 50 kcal
- Green salad with light dressing: 65 kcal
Total: 580 kcal`
        : userData.dietaryPreference === "pescatarian"
        ? `Ingredients breakdown:
- 150g grilled salmon: 250 kcal
- 1 cup brown rice: 215 kcal
- Steamed vegetables: 50 kcal
- Green salad with light dressing: 65 kcal
Total: 580 kcal`
        : `Ingredients breakdown:
- 200g firm tofu: 180 kcal
- 1 cup quinoa: 220 kcal
- Steamed vegetables: 50 kcal
- Green salad with light dressing: 65 kcal
Total: 580 kcal`
    },
    snack2: {
      name: "Greek yogurt (150g) + mixed berries (1 cup) + 1 tbsp honey",
      calories: 280,
      protein: 20,
      carbs: 35,
      fat: 5,
      ingredientBreakdown:
        `Ingredients breakdown:
- 150g Greek yogurt: 130 kcal
- 1 cup mixed berries: 80 kcal
- 1 tbsp honey: 70 kcal
Total: 280 kcal`
    },
    dinner: {
      name: userData.dietaryPreference === "non-vegetarian"
        ? "Baked salmon (150g) + sweet potato (200g) + roasted broccoli + side salad"
        : userData.dietaryPreference === "vegan"
        ? "Lentil shepherd's pie (1.5 cups) + sweet potato (200g) + roasted broccoli + side salad"
        : userData.dietaryPreference === "eggetarian"
        ? "Egg curry (3 eggs) + brown rice (1/2 cup) + roasted vegetables + side salad"
        : userData.dietaryPreference === "pescatarian"
        ? "Grilled tuna (150g) + sweet potato (200g) + roasted broccoli + side salad"
        : "Chickpea curry (1.5 cups) + brown rice (1/2 cup) + roasted vegetables + side salad",
      calories: 500,
      protein: 35,
      carbs: 45,
      fat: 15,
      ingredientBreakdown: userData.dietaryPreference === "non-vegetarian"
        ? `Ingredients breakdown:
- 150g baked salmon: 300 kcal
- 200g sweet potato: 180 kcal
- Roasted broccoli: 50 kcal
- Side salad with dressing: 70 kcal
Total: 500 kcal`
        : userData.dietaryPreference === "vegan"
        ? `Ingredients breakdown:
- 1.5 cups lentil shepherd's pie: 250 kcal
- 200g sweet potato: 180 kcal
- Roasted broccoli: 50 kcal
- Side salad with dressing: 70 kcal
Total: 500 kcal`
        : userData.dietaryPreference === "eggetarian"
        ? `Ingredients breakdown:
- 3 egg curry: 220 kcal
- 1/2 cup brown rice: 110 kcal
- Roasted vegetables: 70 kcal
- Side salad with dressing: 70 kcal
Total: 500 kcal`
        : userData.dietaryPreference === "pescatarian"
        ? `Ingredients breakdown:
- 150g grilled tuna: 280 kcal
- 200g sweet potato: 180 kcal
- Roasted broccoli: 50 kcal
- Side salad with dressing: 70 kcal
Total: 500 kcal`
        : `Ingredients breakdown:
- 1.5 cups chickpea curry: 250 kcal
- 1/2 cup brown rice: 110 kcal
- Roasted vegetables: 70 kcal
- Side salad with dressing: 70 kcal
Total: 500 kcal`
    },
    beforeBed: {
      name: "Protein pancake (before bed): 1 whole egg, 1/2 banana, 1 tsp chia or flaxseed, 1 scoop casein/whey, 1 tsp almond/peanut butter",
      calories: 375,
      protein: 30,
      carbs: 30,
      fat: 15,
      ingredientBreakdown:
        `Ingredients breakdown:
- 1 whole egg: 70 kcal
- 1/2 banana: 50 kcal
- 1 tsp chia/flax: 20 kcal
- 1 scoop casein/whey: 180 kcal
- 1 tsp almond/peanut butter: 55 kcal
Total: 375 kcal`
    },
    preWorkout: {
      name: "Pre-workout (optional): 1 scoop C4 or 1/2 tbsp coffee + 240ml water",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      ingredientBreakdown: "Optional pre-workout supplement or coffee as per LEAN MODE."
    },
    postWorkout: {
      name: "Post-workout: 1-2 scoop whey protein + 250ml milk or 6 boiled egg whites + 1 banana",
      calories: 400,
      protein: 30,
      carbs: 70,
      fat: 0,
      ingredientBreakdown:
        `Ingredients breakdown (example whey option):
- 1-2 scoops whey: ~200 kcal
- 240ml milk / sports drink: ~200 kcal
- banana + honey as recommended
Total: ~400 kcal`
    }
  };

  // --- Meals from WEIGHT LOSS X (Guru Mann) — used for weight_loss goals. Source: WEIGHT_LOSS_X PDF. :contentReference[oaicite:5]{index=5}
  const weightLossMeals = {
    breakfast: {
      name: "Whole grain breakfast: 40g whole grain cereal + low-fat milk + 2 slices wheat bread OR 2-egg omelette (per weekday variations)",
      calories: 410,
      protein: 28,
      carbs: 50,
      fat: 10,
      ingredientBreakdown:
        `Ingredients breakdown (example cereal option):
- 40g whole grain cereals: ~160 kcal
- 250ml low-fat milk: ~90 kcal
- 2 slices wheat bread: ~140 kcal
Total: 410 kcal`
    },
    morningSnack: {
      name: "Fruit snack: choose one — 1 apple / 1 pear / 1 cup grapes / 1 kiwi / 1 orange / 1 cup papaya",
      calories: 80,
      protein: 0,
      carbs: 20,
      fat: 0,
      ingredientBreakdown: "- 1 piece fruit (calories depend on fruit; ~70-100 kcal each)."
    },
    lunch: {
      name: "Lentil + roti + mixed salad: 1 bowl lentil (dal), 1 roti, 1 plate mixed salad",
      calories: 410,
      protein: 25,
      carbs: 50,
      fat: 10,
      ingredientBreakdown:
        `Ingredients breakdown:
- 1 bowl lentil (dal): ~180 kcal
- 1 roti: ~80-100 kcal
- mixed salad + light dressing: ~50-70 kcal
- optional rajma/channe variants per weekday as in PDF
Total: ~410 kcal`
    },
    eveningSnack: {
      name: "Nuts + tea/coffee: rotate between 20 almonds / 4 walnuts / 20 cashews + 1 cup tea/coffee",
      calories: 150,
      protein: 4,
      carbs: 6,
      fat: 14,
      ingredientBreakdown: "- 20 almonds: ~140 kcal; or 4 walnuts: ~100 kcal plus tea ~20-40 kcal"
    },
    dinner: {
      name: "Simple veg dinner: 1 bowl green beans/bell pepper/paneer bhurji + 1 roti + salad",
      calories: 410,
      protein: 25,
      carbs: 50,
      fat: 10,
      ingredientBreakdown:
        `Ingredients breakdown:
- 1 bowl vegetable sabji (green beans, bell pepper, etc.): ~100-150 kcal
- 1 roti: ~80-100 kcal
- paneer bhurji (if present) or lentils: ~150-180 kcal
Total: ~410 kcal`
    },
    postWorkout: {
      name: "Post-workout (weight loss plan): 250ml milk or 1 scoop whey isolate in water or 4 boiled egg whites",
      calories: 250,
      protein: 25,
      carbs: 10,
      fat: 5,
      ingredientBreakdown: "- 250ml milk: ~120 kcal; whey isolate ~120 kcal; 4 egg whites: ~68 kcal"
    }
  };

  // Decide which base meals to use depending on user's goal
  const useWeightLoss = (userData.goal === "weight_loss");
  const baseMeals = useWeightLoss ? weightLossMeals : leanModeMeals;

  // Build single day meals with proper null checking
  const meals: any = {};

  // Breakfast
  meals.breakfast = {
    ...baseMeals.breakfast,
    calories: baseMeals.breakfast?.calories ?? breakfastCalories,
    protein: Math.round(protein * 0.25),
    carbs: Math.round(carbs * 0.25),
    fat: Math.round(fat * 0.25)
  };

  // Choose lunch
  meals.lunch = {
    ...baseMeals.lunch,
    calories: baseMeals.lunch?.calories ?? lunchCalories,
    protein: Math.round(protein * 0.35),
    carbs: Math.round(carbs * 0.35),
    fat: Math.round(fat * 0.35)
  };

  // Dinner
  meals.dinner = {
    ...baseMeals.dinner,
    calories: baseMeals.dinner?.calories ?? dinnerCalories,
    protein: Math.round(protein * 0.30),
    carbs: Math.round(carbs * 0.30),
    fat: Math.round(fat * 0.30)
  };

  // Snacks (if the plan uses them)
  // For LEAN_MODE we use snack1 & snack2 (mapped to 'snacks' key). For WEIGHT_LOSS X we may expose morningSnack/eveningSnack.
  if (useWeightLoss) {
    const weightLossMeals = baseMeals as any;
    meals.morningSnack = {
      ...weightLossMeals.morningSnack,
      calories: weightLossMeals.morningSnack?.calories ?? Math.round(totalCalories * 0.10),
      protein: Math.round(protein * 0.05),
      carbs: Math.round(carbs * 0.05),
      fat: Math.round(fat * 0.05)
    };
    meals.eveningSnack = {
      ...weightLossMeals.eveningSnack,
      calories: weightLossMeals.eveningSnack?.calories ?? Math.round(totalCalories * 0.10),
      protein: Math.round(protein * 0.05),
      carbs: Math.round(carbs * 0.05),
      fat: Math.round(fat * 0.05)
    };
  } else {
    const leanModeMeals = baseMeals as any;
    meals.snacks = {
      ...leanModeMeals.snack1,
      calories: leanModeMeals.snack1?.calories ?? snacksCalories,
      protein: Math.round(protein * 0.10),
      carbs: Math.round(carbs * 0.10),
      fat: Math.round(fat * 0.10),
      alternatives: [
        leanModeMeals.snack2,
        // include a light fruit + nut option
        {
          name: "Apple + 1 tbsp almond butter",
          calories: 200,
          description: "Simple fruit + healthy fat snack"
        }
      ]
    };
    // include beforeBed as a separate slot when present in LEAN_MODE
    meals.beforeBed = {
      ...leanModeMeals.beforeBed
    };
  }

  // Weekly plan: rotate the core meals for variety and provide 1-2 alternatives per meal.
  // We create 7 days; each day is different by rotating between core items from the selected PDF.
  const weeklyPlan: any = {};
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];

  for (let i = 0; i < 7; i++) {
    const day = days[i];
    // Create variety by rotating different meals for each day while keeping same format
    if (useWeightLoss) {
      // Different breakfast names for each day (same base structure)
      const breakfastNames = userData.dietaryPreference === "vegan" 
        ? [
            "Tofu scramble with turmeric + whole wheat bread + spinach",
            "Overnight oats with plant protein + berries + nuts", 
            "Avocado toast with chickpea flour spread + fruit",
            "Coconut yogurt parfait + granola + seeds",
            "Quinoa porridge with almond milk + cinnamon + fruit", 
            "Chia pudding with coconut milk + berries",
            "Protein smoothie with plant protein + oats + banana"
          ]
        : userData.dietaryPreference === "eggetarian"
        ? [
            "Egg white omelette + whole grain toast + avocado",
            "Overnight oats with eggs + berries + nuts", 
            "Scrambled eggs with spinach + whole wheat bread + fruit",
            "Cottage cheese + fruits + nuts + hard boiled eggs",
            "Egg muffins with vegetables + whole wheat bread + spinach", 
            "Protein porridge with egg whites + cinnamon + fruit",
            "Greek yogurt with eggs + granola + berries"
          ]
        : userData.dietaryPreference === "pescatarian"
        ? [
            "Smoked salmon toast + avocado + fruit",
            "Overnight oats with protein powder + berries + nuts", 
            "Egg white omelette + whole grain toast + avocado",
            "Cottage cheese + fruits + nuts + smoked salmon",
            "Tofu scramble + whole wheat bread + spinach + lox", 
            "Quinoa porridge with protein powder + cinnamon + fruit",
            "Greek yogurt with granola + berries + fish"
          ]
        : userData.dietaryPreference === "non-vegetarian"
        ? [
            "Protein smoothie with whey + oats + banana",
            "Overnight oats + protein powder + berries",
            "Egg white omelette + whole grain toast + avocado",
            "Cottage cheese + fruits + nuts",
            "Tofu scramble + whole wheat bread + spinach",
            "Quinoa porridge + protein powder + cinnamon",
            "Protein bars + fruit + green tea"
          ]
        : [
            "Whole grain cereal with low-fat milk + wheat bread",
            "Oatmeal with fruits + nuts", 
            "Vegetable poha + peanuts",
            "Idli with sambar + chutney",
            "Besan chilla with mint chutney", 
            "Sprouts salad + fruit",
            "Paratha with curd + pickle"
          ];

      // Different lunch names for each day (same base structure)
      const lunchNames = userData.dietaryPreference === "vegan"
        ? [
            "Chickpea curry + brown rice + steamed vegetables + green salad",
            "Lentil dal + quinoa + roasted vegetables + salad", 
            "Tofu stir-fry + brown rice + steamed vegetables + green salad",
            "Black bean bowl + brown rice + mixed vegetables + salsa",
            "Vegetable biryani + cucumber raita + salad", 
            "Moong dal chilla + chutney + salad",
            "Quinoa buddha bowl + roasted vegetables + tahini"
          ]
        : userData.dietaryPreference === "eggetarian"
        ? [
            "Egg curry + brown rice + steamed vegetables + green salad",
            "Lentil dal + quinoa + egg curry + salad", 
            "Tofu stir-fry + boiled eggs + brown rice + green salad",
            "Egg fried rice + mixed vegetables + salad",
            "Egg biryani + cucumber raita + salad", 
            "Moong dal chilla + egg curry + salad",
            "Quinoa bowl + hard boiled eggs + roasted vegetables"
          ]
        : userData.dietaryPreference === "pescatarian"
        ? [
            "Grilled salmon + brown rice + steamed vegetables + green salad",
            "Tuna curry + quinoa + roasted vegetables + salad", 
            "Fish stir-fry + brown rice + steamed vegetables + green salad",
            "Shrimp bowl + brown rice + mixed vegetables + salsa",
            "Fish biryani + cucumber raita + salad", 
            "Moong dal chilla + grilled fish + salad",
            "Quinoa bowl + grilled tuna + roasted vegetables"
          ]
        : userData.dietaryPreference === "non-vegetarian"
        ? [
            "Grilled chicken breast + brown rice + steamed vegetables + green salad",
            "Tofu stir-fry + quinoa + steamed vegetables + green salad",
            "Grilled salmon + sweet potato + asparagus",
            "Lentil curry + brown rice + mixed vegetables",
            "Greek salad + grilled chicken + quinoa",
            "Paneer tikka + roti + salad"
          ]
        : [
            "Lentil dal + brown rice + roti + mixed salad",
            "Chickpea curry + roti + cucumber salad",
            "Mixed vegetable curry + roti + raita", 
            "Sambar + rice + vegetable stir fry",
            "Khichdi + kadhi + papad",
            "Moong dal chilla + chutney + salad",
            "Vegetable biryani + raita"
          ];

      // Different dinner names for each day (same base structure)
      const dinnerNames = userData.dietaryPreference === "vegan"
        ? [
            "Lentil shepherd's pie + sweet potato + roasted broccoli + side salad",
            "Chickpea curry + brown rice + roasted vegetables + side salad",
            "Tofu buddha bowl + peanut sauce + vegetables + side salad", 
            "Black bean stew + quinoa + roasted vegetables + salad",
            "Vegetable lasagna + green salad + garlic bread", 
            "Mushroom stir-fry + brown rice + steamed vegetables",
            "Lentil moussaka + roasted potatoes + side salad"
          ]
        : userData.dietaryPreference === "eggetarian"
        ? [
            "Egg curry + brown rice + roasted vegetables + side salad",
            "Lentil shepherd's pie + boiled eggs + sweet potato + side salad",
            "Tofu buddha bowl + scrambled eggs + vegetables + side salad", 
            "Egg fried rice + mixed vegetables + salad",
            "Egg lasagna + green salad + garlic bread", 
            "Mushroom stir-fry + egg curry + brown rice",
            "Lentil moussaka + hard boiled eggs + side salad"
          ]
        : userData.dietaryPreference === "pescatarian"
        ? [
            "Grilled tuna + sweet potato + roasted broccoli + side salad",
            "Fish curry + brown rice + roasted vegetables + side salad",
            "Shrimp stir-fry + quinoa + vegetables + side salad", 
            "Baked salmon + roasted potatoes + mixed vegetables + salad",
            "Fish tacos + slaw + salsa + side salad", 
            "Mushroom stir-fry + grilled fish + brown rice",
            "Tuna bake + roasted vegetables + side salad"
          ]
        : userData.dietaryPreference === "non-vegetarian"
        ? [
            "Baked salmon + sweet potato + roasted broccoli + side salad",
            "Chickpea curry + brown rice + roasted vegetables + side salad",
            "Grilled chicken + roasted vegetables + quinoa",
            "Tofu buddha bowl + peanut sauce + vegetables",
            "Lentil shepherd's pie + side salad",
            "Shrimp stir-fry + vegetables + brown rice"
          ]
        : [
            "Green beans sabzi + roti + salad",
            "Paneer bhurji + roti + green salad",
            "Mixed vegetable stew + roti",
            "Cauliflower curry + roti + salad", 
            "Spinach corn curry + roti",
            "Bottle gourd curry + roti",
            "Mixed dal tadka + roti + salad"
          ];

      weeklyPlan[day] = {
        breakfast: {
          ...weightLossMeals.breakfast,
          name: breakfastNames[i],
          calories: weightLossMeals.breakfast?.calories ?? Math.round(totalCalories * 0.25),
          protein: Math.round(protein * 0.25),
          carbs: Math.round(carbs * 0.25),
          fat: Math.round(fat * 0.25),
          alternatives: [
            { name: "2-egg omelette + 1 slice whole wheat bread", calories: 350, description: "Egg-based protein breakfast" },
            { name: "Greek yogurt (150g) + 30g oats + 1 small fruit", calories: 370, description: "Protein-rich dairy option" }
          ]
        },
        lunch: {
          ...weightLossMeals.lunch,
          name: lunchNames[i],
          calories: weightLossMeals.lunch?.calories ?? Math.round(totalCalories * 0.35),
          protein: Math.round(protein * 0.35),
          carbs: Math.round(carbs * 0.35),
          fat: Math.round(fat * 0.35),
          alternatives: [
            { name: "Rajma bowl + 1 roti + salad", calories: 410, description: "Kidney beans variant" },
            { name: "Channa (chickpea) bowl + roti + salad", calories: 410, description: "Chickpea variant" }
          ]
        },
        dinner: {
          ...weightLossMeals.dinner,
          name: dinnerNames[i],
          calories: weightLossMeals.dinner?.calories ?? Math.round(totalCalories * 0.25),
          protein: Math.round(protein * 0.25),
          carbs: Math.round(carbs * 0.25),
          fat: Math.round(fat * 0.25),
          alternatives: [
            { name: "Steamed mixed vegetables + 1 roti + bowl dal", calories: 380, description: "Lower-calorie veg dinner" }
          ]
        },
        morningSnack: {
          ...weightLossMeals.morningSnack,
          calories: weightLossMeals.morningSnack?.calories ?? Math.round(totalCalories * 0.10),
          alternatives: [
            { name: "1 small banana", calories: 90, description: "Quick fruit option" },
            { name: "1 orange", calories: 80, description: "Citrus fruit" },
            { name: "1 apple", calories: 95, description: "Crispy fruit" }
          ].slice(i % 3, i % 3 + 1)
        },
        eveningSnack: {
          ...weightLossMeals.eveningSnack,
          calories: weightLossMeals.eveningSnack?.calories ?? Math.round(totalCalories * 0.10),
          alternatives: [
            { name: "10-12 roasted chana", calories: 120, description: "High-fiber snack" },
            { name: "20 almonds", calories: 140, description: "Healthy nuts" },
            { name: "4 walnuts", calories: 100, description: "Omega-3 rich" }
          ].slice(i % 3, i % 3 + 1)
        }
      };
    } else {
      // Different breakfast names for lean mode (same base structure)
      const breakfastNames = [
        "Protein smoothie with whey + oats + banana",
        "Overnight oats + plant protein + berries",
        "Egg white omelette + whole grain toast + avocado",
        "Cottage cheese + fruits + nuts",
        "Tofu scramble + whole wheat bread + spinach",
        "Quinoa porridge + protein powder + cinnamon",
        "Protein bars + fruit + green tea"
      ];

      // Different lunch names for lean mode (same base structure)
      const lunchNames = [
        "Grilled chicken breast + brown rice + steamed vegetables",
        "Tofu stir-fry + quinoa + steamed vegetables",
        "Grilled salmon + sweet potato + asparagus",
        "Lentil curry + brown rice + mixed vegetables",
        "Greek salad + grilled chicken + quinoa",
        "Paneer tikka + roti + salad"
      ];

      // Different dinner names for lean mode (same base structure)
      const dinnerNames = [
        "Baked salmon + sweet potato + roasted broccoli",
        "Chickpea curry + brown rice + roasted vegetables",
        "Grilled chicken + roasted vegetables + quinoa",
        "Tofu buddha bowl + peanut sauce + vegetables",
        "Lentil shepherd's pie + side salad",
        "Shrimp stir-fry + vegetables + brown rice"
      ];

      weeklyPlan[day] = {
        breakfast: {
          ...leanModeMeals.breakfast,
          name: breakfastNames[i],
          calories: leanModeMeals.breakfast?.calories ?? Math.round(totalCalories * 0.25),
          protein: Math.round(protein * 0.25),
          carbs: Math.round(carbs * 0.25),
          fat: Math.round(fat * 0.25),
          alternatives: [
            { name: "Protein smoothie with 1 tbsp peanut butter", calories: 450, description: "Higher-fat smoothie" },
            { name: "Overnight oats + plant protein", calories: 360, description: "No-cook alternative" }
          ]
        },
        lunch: {
          ...leanModeMeals.lunch,
          name: lunchNames[i],
          calories: leanModeMeals.lunch?.calories ?? Math.round(totalCalories * 0.35),
          protein: Math.round(protein * 0.35),
          carbs: Math.round(carbs * 0.35),
          fat: Math.round(fat * 0.35),
          alternatives: [
            { name: "Buddha bowl: brown rice + roasted chickpeas + tahini", calories: 450, description: "High-fiber plant bowl" },
            { name: "Quinoa + roasted veg + tofu (or chicken if non-vegetarian)", calories: 420, description: "Complete-protein bowl" }
          ]
        },
        dinner: {
          ...leanModeMeals.dinner,
          name: dinnerNames[i],
          calories: leanModeMeals.dinner?.calories ?? Math.round(totalCalories * 0.30),
          protein: Math.round(protein * 0.30),
          carbs: Math.round(carbs * 0.30),
          fat: Math.round(fat * 0.30),
          alternatives: [
            { name: "Mushroom stroganoff + whole wheat pasta", calories: (leanModeMeals.dinner?.calories ?? Math.round(totalCalories * 0.30)) + 50, description: "Comfort-meal alternative" },
            { name: "Thai green curry with tofu and jasmine rice", calories: (leanModeMeals.dinner?.calories ?? Math.round(totalCalories * 0.30)) - 50, description: "Aromatic curry option" }
          ]
        },
        snacks: {
          ...leanModeMeals.snack1,
          calories: leanModeMeals.snack1?.calories ?? Math.round(totalCalories * 0.10),
          alternatives: [
            { name: "Roasted chickpeas (1 cup)", calories: 200, description: "Crunchy high-protein snack" },
            { name: "Rice cakes + almond butter + banana", calories: 260, description: "Energy snack" }
          ]
        },
        beforeBed: {
          ...leanModeMeals.beforeBed
        }
      };
    }
  }

  // Return the complete plan
  return {
    meals,
    weeklyPlan,
    nutritionTips: [
      "Drink at least 8 glasses of water throughout the day",
      "Eat slowly and mindfully to improve digestion",
      "Include a source of protein in every meal",
      "Choose whole foods over processed options",
      "Adjust portion sizes based on your hunger and activity levels",
      "Meal prep on weekends to save time during busy weekdays",
      "Listen to your body's hunger and fullness cues",
      "Include healthy fats like nuts, seeds, and avocado"
    ],
    calorieTarget: totalCalories.toString(),
    proteinTarget: protein.toString(),
    carbTarget: carbs.toString(),
    fatTarget: fat.toString()
  };
}
