# FyteAI · Supabase SQL

Paste these files **one at a time** in the Supabase SQL Editor, in number order.

Each file is safe to re-run (`IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`).

## Paste order

| File | What it is | When you need it |
|---|---|---|
| [`schema/00_extensions_and_helpers.sql`](schema/00_extensions_and_helpers.sql) | Extensions + `updated_at` trigger function | Always first |
| [`schema/01_user_profiles.sql`](schema/01_user_profiles.sql) | Auth profile row, signup trigger | Required |
| [`schema/02_ai_plans.sql`](schema/02_ai_plans.sql) | Saved diet + workout plans (`/diet`, `/workout`) | Required |
| [`schema/03_personal_fitness.sql`](schema/03_personal_fitness.sql) | Weight, old workout entries, goals, achievements, daily nutrition, photos | Required (legacy + profile) |
| [`schema/04_progress_tracking.sql`](schema/04_progress_tracking.sql) | Meal logs, workout set logs, vitals, weekly reviews (`/progress`) | Required for tracking |
| [`schema/05_fyte_connect.sql`](schema/05_fyte_connect.sql) | Trainers, bookings, ratings (creators tables unused for now) | Trainers page |
| [`schema/06_storage.sql`](schema/06_storage.sql) | Storage buckets | Photos / trainer avatars |
| [`schema/07_fyte_connect_instagram.sql`](schema/07_fyte_connect_instagram.sql) | Instagram handle on trainers + creators | Trainer Instagram buttons |
| [`schema/08_trainer_profile_columns.sql`](schema/08_trainer_profile_columns.sql) | Missing trainer columns (`avatar_url`, etc.) | Paste if Become a trainer save fails |

## Already pasted old SQL?

If you already ran the “Personal Fitness Data Schema” or “User Profiles & Diet Plans” dump:

1. Still run **00** then **01** (adds missing columns like `meals_per_day`, calorie targets).
2. Run **02** — your old dumps did **not** create `diet_plans` / `workout_plans`.
3. Run **03** — adds `daily_nutrition.meals` and unique weight index.
4. Run **04** — this is the current `/progress` tracker.
5. Run **05** and **06** only if you use Trainers / photos.
6. Run **07** if you already ran **05** before Instagram was added.
7. Run **08** if Become a trainer fails with a missing `avatar_url` (or similar) column.

Do **not** drop tables. These files only add.

## New empty project

Paste 00 → 08 in order. That is the full app schema.
