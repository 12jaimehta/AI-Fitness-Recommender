/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DietPlanFormData } from "@/shared/validation/dietPlanSchema";

export function generateFallbackPlan(userData: DietPlanFormData, totalCalories: number, protein: number, carbs: number, fat: number) {
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
  const useWeightLoss = (userData.goal === "fat_loss");
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
