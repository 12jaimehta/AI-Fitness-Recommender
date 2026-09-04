# What we are building now

The product is an **AI personal trainer** that keeps an eye on one person, without judgement. Diet and workout generators are how week 1 appears. Everything we charge for happens after that, on Tracking (`/progress`).

The full HLD, LLD, trainer source of truth, and scale rules are in [`COACH.md`](COACH.md). Paste [`supabase/schema/11_coach.sql`](supabase/schema/11_coach.sql) after the other schema files.

Marketplace (Fyte Connect) stays paused until checkout is real.

## Why people will pay

They can get a meal list from ChatGPT in two minutes. They pay when the app **watches the week and patches the slot that broke** — the meal they hated, the plate that was not the plan, the session they skipped — and tells them honestly what that does to the goal.

## The bet

**Today is the coach.** Not a 14-day automatic calorie cut. Not logging every set. Not regenerating the whole plan because Tuesday lunch was boring.

- Slots have a budget (kcal/protein or session time).
- The person taps as planned / something else / I don’t like this / I trained / I skipped.
- Something else: photo or a sentence, then a few trainer questions (butter, drink, portion). Code owns the math.
- Don’t like a meal: questions, then 2–3 options **inside that slot’s budget**. Only that cell changes.
- Surplus: extra walk today, or fold into tomorrow. Show delay in days.
- Weekly: attendance, weekly weight average, waist if they logged it. Hold if it is working. Extra steps or one smaller meal only after weeks of real follow-through.

Copy is factual. Never “cheat.” Never a lecture.

## UI

`bg-gray-50` pages, `#282828` (`fyte-ink`) buttons, white `rounded-2xl` cards, chip `FormSelect` fields, `FormInput` / `FormTextarea`. See `src/shared/lib/ui.ts`.

## What “done” looks like for this slice

- Signed-in home is Tracking (`/progress`), labelled Coach.
- With no plan: make a diet / make a workout (week 1 fill).
- With a plan: today’s slots, check-in, extra steps if needed, this week’s review.
- Disliked meal replaces **that** meal. A different plate updates the ledger. The rest of the week stays.
