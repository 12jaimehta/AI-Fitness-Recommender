# FYTE AI — Progress Tracking System Design & Architecture Reference (HLD & LLD)

> **Document Purpose**: Complete High-Level Design (HLD), Low-Level Design (LLD), API Contracts, Supabase Database Schemas, and AI Integration workflows for the **Personalized Progress Tracking** module in Fyte AI. Designed to be plugged directly into Cursor AI for implementation.

---

## 1. Executive Summary & Philosophy

Fyte AI's progress tracking system solves the #1 issue in modern fitness apps: **tracking friction and cognitive overload**. Typical users do not know or want to measure 150g of chicken breast, calculate grams of carbohydrates, or manually enter sets/reps.

### Core Principles
1. **Frictionless 1-Tap Adherence**: Because the user already has an active AI-generated Diet and Workout Plan from `/api/current/plans`, tracking should be as simple as tapping *"Ate as planned"* or *"Workout completed"*.
2. **AI-Assisted Natural Language & Vision Logging**: When deviating from the plan, users log meals or exercises using plain English (e.g., *"Ate 2 butter rotis, paneer bhurji, and a bowl of dal"*) or snapping a photo. AI parses nutritional estimates automatically.
3. **10-Second Daily Check-in**: Track high-leverage signals (Weight, Hydration, Energy/Mood, Sleep, Workout Completion) within 10 seconds.
4. **Adaptive Feedback Loop**: Tracked data feeds back into the AI engine for weekly check-ins, auto-calibrating future diet/workout plans to prevent plateaus.

---

## 2. High-Level Architecture (HLD)

### System Flow Diagram

```mermaid
flowchart TD
    subgraph Upstream Dependency
        CP["GET /api/current/plans"] -->|Returns Active Diet & Workout Targets| Client["Next.js Client (App Router)"]
    end

    subgraph User Interaction Modes (Frictionless UX)
        Client --> M1["Mode 1: 1-Tap Plan Check-off (Default)"]
        Client --> M2["Mode 2: AI Natural Language / Voice Log"]
        Client --> M3["Mode 3: AI Meal Photo Snap"]
        Client --> M4["Mode 4: 10s Daily Vitals (Weight, Water, Mood)"]
    end

    subgraph Backend / Next.js API Routes
        M1 --> APILog["POST /api/progress/meals/quick-check\nPOST /api/progress/workouts/quick-check"]
        M2 & M3 --> AIAssist["POST /api/progress/meals/ai-log\nPOST /api/progress/workouts/ai-log"]
        M4 --> APIMetrics["POST /api/progress/metrics"]
        
        AIAssist --> OpenAILLM["AI Engine (Gemini / Claude / OpenAI Vision)"]
        OpenAILLM -->|Structured JSON Output| APILog
    end

    subgraph Data & Storage (Supabase)
        APILog & APIMetrics --> DB[(Supabase PostgreSQL)]
        M3 --> S3[(Supabase Storage: meal-photos, progress-photos)]
    end

    subgraph Analytics & Adaptive Engine
        DB --> Aggregator["GET /api/progress/analytics"]
        DB --> AIWeekly["POST /api/progress/ai-insights/weekly-review"]
        AIWeekly -->|Plan Calibration Recommendations| CP
    end
```

---

## 3. Dependency: Upstream Plan Ingestion (`/api/current/plans`)

The progress module **does not generate plans**, but consumes the currently active plan as its baseline baseline ground truth.

### Endpoint: `GET /api/current/plans`
Returns the active diet plan targets (calories, macros, meal slots) and active workout split for the authenticated user.

#### Sample Response Contract:
```typescript
export interface CurrentPlansResponse {
  success: boolean;
  data: {
    diet_plan: {
      id: string;
      plan_name: string;
      target_calories: number;
      target_protein_g: number;
      target_carbs_g: number;
      target_fat_g: number;
      target_water_ml: number;
      meals: Array<{
        meal_id: string;
        meal_name: "breakfast" | "lunch" | "snack" | "dinner";
        recommended_time: string;
        items: Array<{
          name: string;
          portion: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
        }>;
        total_meal_calories: number;
        total_meal_protein: number;
      }>;
    };
    workout_plan: {
      id: string;
      split_name: string;
      weekly_frequency: number;
      today_workout: {
        workout_id: string;
        day_of_week: string;
        focus_area: string; // e.g. "Chest & Triceps"
        is_rest_day: boolean;
        estimated_duration_min: number;
        exercises: Array<{
          exercise_id: string;
          name: string;
          target_sets: number;
          target_reps: string; // e.g. "8-12"
          rest_seconds: number;
        }>;
      };
    };
  };
}
```

---

## 4. Simplified User Experience (UX) Flow for Beginners

| UX Feature | Beginner-Friendly Solution | AI Role |
| :--- | :--- | :--- |
| **Meal Tracking** | Default shows today's planned meals with a single green checkbox: *"I ate this meal"*. | If unchecked or modified, user talks/types in conversational text. AI converts into estimated calories & protein. |
| **Food Recognition** | User snaps a picture of their plate. | Vision AI identifies dishes (e.g., Dal Tadka, Rice, Salad) and calculates sensible portions + calories automatically. |
| **Workout Logging** | 1-Tap *"Workout Complete"*, with simple sliders for *"How hard was it? (1-5)"* and *"Duration (mins)"*. | AI calculates estimated calories burned based on user weight and workout intensity. |
| **Vitals & Daily Stats** | Quick slider/taps for: Weight (kg), Water (glasses tapped +1), Sleep (hrs), Energy (1-5 stars). | AI correlates sleep + water with workout performance and flags patterns. |
| **Progress Review** | No complicated data tables. Clean visual rings (Calories, Protein, Workouts, Hydration) + AI weekly encouraging audio/text summary. | AI compares target vs actual and provides simple weekly action items. |

---

## 5. Low-Level Database Design (Supabase PostgreSQL Schema)

Run this schema inside Supabase SQL Editor.

```sql
-- 1. Daily Progress & Vitals Log
CREATE TABLE public.daily_progress_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC(5,2),
    water_intake_ml INTEGER DEFAULT 0,
    sleep_hours NUMERIC(3,1),
    energy_rating INTEGER CHECK (energy_rating BETWEEN 1 AND 5),
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    notes TEXT,
    ai_daily_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- 2. Meal Progress Logs (Supports Plan Check-off, AI Text, & Photo Logs)
CREATE TABLE public.meal_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    meal_slot VARCHAR(20) NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'snack', 'dinner', 'other')),
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('plan_checkoff', 'ai_text', 'ai_vision', 'manual')),
    meal_name VARCHAR(255) NOT NULL,
    items JSONB DEFAULT '[]'::jsonb, -- Array of items: [{name, portion, calories, protein_g, carbs_g, fat_g}]
    total_calories INTEGER NOT NULL DEFAULT 0,
    total_protein_g NUMERIC(5,1) DEFAULT 0,
    total_carbs_g NUMERIC(5,1) DEFAULT 0,
    total_fat_g NUMERIC(5,1) DEFAULT 0,
    is_plan_compliant BOOLEAN DEFAULT true,
    photo_url TEXT,
    ai_confidence_score NUMERIC(3,2), -- 0.00 to 1.00
    ai_explanation TEXT,
    logged_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Workout Progress Logs
CREATE TABLE public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_plan_id UUID, -- Reference to active workout plan if applicable
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('plan_checkoff', 'ai_text', 'manual')),
    title VARCHAR(255) NOT NULL, -- e.g. "Chest & Triceps" or "30 min evening run"
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    rpe_rating INTEGER CHECK (rpe_rating BETWEEN 1 AND 10), -- Rate of Perceived Exertion
    calories_burned_estimated INTEGER,
    exercises_completed JSONB DEFAULT '[]'::jsonb, -- [{exercise_name, sets_completed, reps_done, weight_kg}]
    is_completed BOOLEAN DEFAULT true,
    notes TEXT,
    logged_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Body Metrics & Progress Media Logs
CREATE TABLE public.body_metrics_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    body_fat_percentage NUMERIC(4,1),
    waist_cm NUMERIC(5,1),
    chest_cm NUMERIC(5,1),
    hips_cm NUMERIC(5,1),
    front_photo_url TEXT,
    side_photo_url TEXT,
    back_photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. AI Weekly Review & Calibration
CREATE TABLE public.ai_weekly_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    avg_calories_adherence_pct NUMERIC(5,2),
    workouts_completed_count INTEGER,
    workouts_target_count INTEGER,
    weight_delta_kg NUMERIC(4,2),
    ai_status VARCHAR(30) CHECK (ai_status IN ('on_track', 'slight_stall', 'needs_adjustment', 'surpassing_target')),
    ai_feedback_summary TEXT NOT NULL,
    ai_action_items JSONB DEFAULT '[]'::jsonb,
    recommended_plan_modifications JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, week_start_date)
);

-- Indices for rapid dashboard queries
CREATE INDEX idx_daily_progress_user_date ON public.daily_progress_logs(user_id, date);
CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, date);
CREATE INDEX idx_workout_logs_user_date ON public.workout_logs(user_id, date);
CREATE INDEX idx_body_metrics_user_date ON public.body_metrics_logs(user_id, date);
```

---

## 6. REST API Specifications (Next.js App Router Routes)

### 6.1 `GET /api/progress/daily`
Fetches a merged daily snapshot (Active Plan Targets vs. Actual Logged Progress) for the selected date.

* **Query Params**: `?date=YYYY-MM-DD` (defaults to today in user timezone)
* **Response**:
```json
{
  "success": true,
  "data": {
    "date": "2026-08-30",
    "targets": {
      "calories": 2100,
      "protein_g": 140,
      "water_ml": 3000,
      "is_workout_day": true,
      "workout_focus": "Chest & Triceps"
    },
    "actuals": {
      "total_calories": 1650,
      "total_protein_g": 115,
      "water_intake_ml": 2250,
      "weight_kg": 76.4,
      "sleep_hours": 7.5,
      "energy_rating": 4,
      "workout_completed": true,
      "meals_logged": [
        {
          "id": "uuid-1",
          "meal_slot": "breakfast",
          "meal_name": "Oatmeal with Almonds & Whey",
          "source_type": "plan_checkoff",
          "total_calories": 450,
          "total_protein_g": 35,
          "is_plan_compliant": true
        },
        {
          "id": "uuid-2",
          "meal_slot": "lunch",
          "meal_name": "Paneer Burrito Bowl",
          "source_type": "ai_text",
          "total_calories": 680,
          "total_protein_g": 38,
          "is_plan_compliant": false
        }
      ],
      "workout_log": {
        "id": "uuid-3",
        "title": "Chest & Triceps",
        "duration_minutes": 50,
        "rpe_rating": 8,
        "is_completed": true
      }
    },
    "adherence_score_pct": 88
  }
}
```

---

### 6.2 `POST /api/progress/meals/quick-check`
1-Tap check-off when the user eats exactly what their active diet plan suggested for that slot.

* **Request Body**:
```json
{
  "date": "2026-08-30",
  "meal_slot": "breakfast"
}
```
* **Backend Logic**:
  1. Calls `/api/current/plans` (or internal database service) for the user's active diet plan.
  2. Extracts the items, calories, and macros for the specified `meal_slot`.
  3. Inserts into `meal_logs` with `source_type: "plan_checkoff"`, `is_plan_compliant: true`.

---

### 6.3 `POST /api/progress/meals/ai-log`
Converts non-standard meals, natural language, voice transcripts, or plate photos into structured nutrition logs.

* **Request Body (Text / Voice Input)**:
```json
{
  "date": "2026-08-30",
  "meal_slot": "lunch",
  "input_type": "text",
  "text_prompt": "I had 2 medium chicken shawarma wraps with garlic sauce and one can of zero coke"
}
```

* **Request Body (Vision / Photo Input)**:
```json
{
  "date": "2026-08-30",
  "meal_slot": "lunch",
  "input_type": "image",
  "image_url": "https://supabase-storage.../meal-123.jpg",
  "optional_notes": "Added extra cheese"
}
```

* **Backend LLM Prompt & Processing**:
The system passes the input to the AI model with a strict JSON Schema returning:
```json
{
  "meal_name": "Chicken Shawarma Wraps with Garlic Sauce",
  "items": [
    {
      "name": "Chicken Shawarma Wrap",
      "portion": "2 medium wraps",
      "calories": 780,
      "protein_g": 48,
      "carbs_g": 62,
      "fat_g": 36
    },
    {
      "name": "Coke Zero",
      "portion": "330ml can",
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0
    }
  ],
  "total_calories": 780,
  "total_protein_g": 48,
  "total_carbs_g": 62,
  "total_fat_g": 36,
  "confidence_score": 0.88,
  "ai_explanation": "Estimated 2 standard restaurant-style chicken shawarmas with garlic mayonnaise base."
}
```

---

### 6.4 `POST /api/progress/workouts/quick-check`
1-Tap check-off for completing today's planned workout.

* **Request Body**:
```json
{
  "date": "2026-08-30",
  "rpe_rating": 7,
  "duration_minutes": 45,
  "notes": "Felt energetic, increased bench press weight"
}
```

---

### 6.5 `POST /api/progress/workouts/ai-log`
For unstructured workout logging (e.g. *"Played 45 minutes of intense badminton and did 50 pushups"*).

* **Request Body**:
```json
{
  "date": "2026-08-30",
  "text_prompt": "Played 45 minutes of intense badminton and did 50 pushups"
}
```
* **AI Output Contract**:
```json
{
  "title": "Badminton & Bodyweight Session",
  "duration_minutes": 45,
  "estimated_calories_burned": 320,
  "exercises_completed": [
    { "exercise_name": "Badminton (Competitive)", "sets_completed": 1, "reps_done": "45 mins" },
    { "exercise_name": "Pushups", "sets_completed": 3, "reps_done": "50 total" }
  ]
}
```

---

### 6.6 `POST /api/progress/metrics`
Quick logging of vitals (weight, water, sleep, mood). Supports partial updates.

* **Request Body**:
```json
{
  "date": "2026-08-30",
  "weight_kg": 76.2,
  "water_increment_ml": 250,
  "sleep_hours": 8.0,
  "energy_rating": 5,
  "mood_rating": 5
}
```

---

### 6.7 `GET /api/progress/analytics`
Fetches historical charts and compliance trends.

* **Query Params**: `?range=7d|30d|90d|all`
* **Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "streak_days": 12,
      "avg_adherence_pct": 91,
      "total_workouts_completed": 18,
      "weight_change_kg": -1.8
    },
    "daily_trends": [
      {
        "date": "2026-08-24",
        "weight_kg": 77.5,
        "target_calories": 2100,
        "actual_calories": 2040,
        "target_protein_g": 140,
        "actual_protein_g": 138,
        "workout_completed": true,
        "water_ml": 3000
      }
    ]
  }
}
```

---

### 6.8 `POST /api/progress/ai-insights/weekly-review`
Runs once a week (or on user trigger) to generate an AI evaluation of progress and suggest smart calibrations for the next week's diet & workout plans.

* **Response**:
```json
{
  "success": true,
  "data": {
    "week_period": "Aug 23 - Aug 30, 2026",
    "adherence_score": 92,
    "status": "on_track",
    "ai_headline": "🔥 Exceptional week! Down 0.8 kg while hitting all 4 strength sessions.",
    "insights": [
      "Protein goal was reached on 6 out of 7 days (avg 136g/140g).",
      "Hydration dipped on Wednesday & Friday, which correlated with lower energy ratings."
    ],
    "recommendations_for_plans": {
      "diet_adjustment": "Keep calories steady at 2100 kcal. Increase breakfast protein by 10g for morning satiety.",
      "workout_adjustment": "Progressive overload detected: Increase dumbbell shoulder press weight from 15kg to 17.5kg."
    }
  }
}
```

---

## 7. AI Engine System Prompts & Structured Outputs

### Meal Natural Language Parsing System Prompt
```text
You are Fyte AI's Nutrition Parser. Your job is to convert everyday conversational descriptions of food (or image descriptions) into accurate, structured macronutrient and caloric estimates for everyday users.

Guidelines:
1. Always be realistic with home-cooked portions and restaurant meals.
2. Return strictly valid JSON conforming to the schema.
3. If the user mentions regional foods (e.g. Indian, Mediterranean, Asian), use standard authentic recipes for macro estimations.
4. If exact quantity is missing, assume standard single-serving adult portion.
5. Provide a confidence score between 0.0 and 1.0.
```

---

## 8. Next.js Frontend Component Hierarchy

```text
src/
└── app/
    └── (dashboard)/
        └── progress/
            ├── page.tsx                      // Main Progress Screen
            ├── components/
            │   ├── DailySummaryHeader.tsx    // Today's Date Picker & Streak Badge
            │   ├── QuickVitalsWidget.tsx     // 10s Log: Weight, Sleep, Water Tap (+250ml)
            │   ├── MacroRingProgress.tsx     // Visual Calories & Protein rings (Target vs Actual)
            │   ├── PlannedMealChecklist.tsx  // 1-Tap Checkoff for Breakfast/Lunch/Snack/Dinner
            │   ├── PlannedWorkoutCard.tsx    // Today's Workout 1-Tap "Complete" & RPE Slider
            │   ├── AIMealLogModal.tsx        // Natural Language / Voice / Camera Food Logger
            │   ├── AIWorkoutLogModal.tsx     // Unstructured Workout Logger
            │   ├── AnalyticsCharts.tsx       // Weight trend, Consistency heatmap, Macro adherence
            │   └── AIWeeklyCoachCard.tsx     // Weekly AI Review & Smart Recommendations
```

---

## 9. Key Integration Checklist for Cursor AI

- [ ] **Database Setup**: Execute the PostgreSQL schema in Supabase.
- [ ] **Environment Variables**: Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` or `GEMINI_API_KEY`.
- [ ] **Current Plan Integration**: Ensure `/api/current/plans` returns the user's active diet & workout split.
- [ ] **1-Tap Handlers**: Wire up `POST /api/progress/meals/quick-check` and `POST /api/progress/workouts/quick-check`.
- [ ] **AI Parser Endpoints**: Implement `POST /api/progress/meals/ai-log` with structured output parsing.
- [ ] **State Management**: Use SWR or React Query with optimistic UI updates for instant checkboxes and water counter increments.
