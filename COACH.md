# Fyte Coach — product, HLD, LLD

This is the product we sell and implement. Tracking (`/progress`) is the coach. Diet and workout generators are how week 1 appears. After that the notebook lives here.

Paste `supabase/schema/11_coach.sql` in Supabase after `10_daily_track.sql`.

---

## 1. Goal

An AI personal trainer that keeps an eye on one person, without judgement.

Not a new PDF every time they dislike lunch. Not a calorie exam. Not a 14-day automatic cut. A trainer’s loop: **show up, eat close enough, train hard enough, stay uninjured, change the smallest thing that keeps the goal intact.**

What we sell: **the coach watches you for months, in 4–12 week blocks, and patches the slot that broke.**

---

## 2. What a gym trainer actually does (source of truth)

Stored from the product decision. Implementation follows this, not the old stall / set-logger / full-regenerate product.

### The job

If you hire a personal trainer, they do not generate a plan and leave. They get you to the goal in real life: show up, train hard enough, eat close enough, stay uninjured, adjust when life happens. The plan is the starting notebook. The work is the weekly conversation.

**Before you lift**

- Goal, deadline, what “done” looks like.
- History: injuries, sleep, job hours, who cooks, alcohol, past diets.
- Movement screen: what you can do safely.
- One phase at a time (fat loss *or* muscle *or* strength *or* get consistent).
- A schedule you can keep.
- Food as structure, not a calorie exam. They know you will not weigh every gram.

**Every session**

- They already know yesterday’s sleep, stress, and whether you ate.
- They coach *today*: load, rest, form, when to push, when to stop.
- They write the session down. You are not the spreadsheet.
- If you slept 4 hours or a shoulder niggles, they change **today’s session**, not your identity.
- They send you home with the next 1–3 days, not a new 12-week PDF.

**Between sessions**

- They notice skips, eating out, travel, depletion.
- They ask, without a lecture: what did you eat, hunger, gym feel, any pain.
- They fix **one thing** (swap a meal, drop a set, add a walk). They do not rebuild the program because Tuesday lunch was boring.

**Every few weeks** they look at the body and the logbook together: keep, small change, or new phase.

### What they track, on what basis, for how long

They track few things. If a number does not change a decision, they drop it.

| Signal | What | Why | How long |
|---|---|---|---|
| Attendance | Sessions done vs planned | Miss 40% → fix the calendar, not the macros | Entire relationship |
| Logbook | Exercise, load, sets, reps, easy/right/too hard, pain | Progressive overload. Trainer writes this in the room | For the current 4–12 week block. North-star lifts carry forward |
| Weight | 2–4 morning weigh-ins → **weekly average** | Daily weight is water/salt/gut/cycle | Whole fat-loss phase. Muscle phase: watch, don’t panic |
| Tape + photos | Waist always; photos every 2–4 weeks | Scale can lie; waist usually does not | Every 2–4 weeks for an 8–16 week phase |
| Food | Did the planned meal happen? What was different (oil, pav, cola)? Hunger, energy, protein roughly, steps | They estimate from description or photo, then ask cook questions. Client does not calculate kcal | Daily awareness; formal weekly “how was food?” Chart lasts 4–8 weeks; a single meal is swapped the day they reject it |
| Recovery | Sleep, feel, soreness, mood, cycle if it matters | A stall is often sleep and missed steps, not “need 200 kcal less” | One line most sessions |
| Pain | Sharp pain, red flags | Regress or refer out | Every session, forever |

They do **not** track: your exact snack math, every unsupervised set unless the program depends on it, daily body fat, a lab dashboard.

### On what basis they change the plan

| They see | They do |
|---|---|
| Skipped sessions | Shorter week, closer times. Not a new split |
| Hate a meal | Swap **that** meal, same protein/kcal band |
| Ate out / heavier meal | Same day: more walk, or next meals a bit lighter. No moral talk |
| Stronger, waist down | Hold |
| Scale flat, waist down, lifts up | Hold. Fat is moving |
| 3–4 weeks flat **and** food/steps were real | More steps first, or one smaller meal. Last resort: a bit less food |
| Tired, lifts down, hungry, poor sleep | Eat a bit more or deload. Do not cut |
| Pain on an exercise | Change the exercise |
| 4–8 weeks of hard training | Lighter week, then the next block |
| Goal reached or life blew up | Maintenance 1–2 weeks, then a new phase |

Two weeks of a quiet scale is noise. They wait until the **week average**, the **tape**, and **adherence** agree.

### For how much time

- Weeks 0–2: teaching. Form, showing up, food you can eat.
- Weeks 2–8: first real block. They learn *you*.
- Fat loss: **8–16 weeks** deficit, then **1–2 weeks** maintenance, then another block if needed. About 0.25–0.75 kg/week if compliant.
- Muscle / recomp: **12–24+ weeks**. Trust lifts, photos, tape.
- Strength: years. Programs change every **4–12 weeks**; the trainer stays.
- In-person they see you 2–5 times a week (that *is* the tracking). High-touch remote: daily if something blew up, weekly for the full review. Measurements every 2–4 weeks. New written program every 4–12 weeks. Nutrition chart every 4–8 weeks, or one meal the day you reject it.

They keep an eye on you **for as long as you pay**. Month 1 is diagnosis. Months 2–4 are the work. After that they prevent relapse.

### Copy rule (no judgement)

- Not “cheat.” **Different from the plan.**
- Not “you blew it.” **About 400 extra vs lunch. 2,000 steps today holds it. If not, tomorrow dinner is smaller. Goal slips about 1 day.**
- Not “bad food.” **Heavy butter on two plates does not fit this lunch. Here are three that do, or we take from dinner.**

---

## 3. What this product does

1. **Week 1 fill** — existing diet / workout forms generate the first notebook (slots with a calorie/protein or session contract).
2. **Every day** — Today shows those slots. The person taps: as planned / I ate something else / I don’t like this / I trained / I skipped / it felt easy|right|too hard.
3. **Something else** — photo or one sentence. Then 2–3 trainer questions (butter, pav, drink, portion). Code owns the kcal math. Model names the food.
4. **Don’t like this meal** — 2–3 questions. Offer 2–3 replacements **inside that slot’s budget**. Only that cell changes. Remember the rejection.
5. **Surplus** — extra walk today. If they don’t, carry into tomorrow’s remaining meal. Show honest delay in days.
6. **Weekly review** — attendance, meal follow-through, weekly weight average, waist if logged. Hold if it is working. Extra steps or one smaller meal only after ~3–4 weeks of real adherence and a quiet tape+scale. Never auto −200 kcal at day 14.
7. **Workout slot** — skip / don’t like / too hard → questions → replace **that session**.

The generator is onboarding. The coach is everything after.

---

## 4. HLD (high level)

### North-star loop

```
event on a slot  →  0–3 questions  →  ledger math  →  patch that slot  →  remember why
```

Reads never call the model. Writes call the model only to **parse a plate** or **propose 2–3 options**. Decisions (steps, carry-over, hold vs change, delay days) are TypeScript.

### Why not RAG / MCP / LangChain

- RAG searches a corpus. The coach needs *this user’s* slots and preferences.
- MCP is for IDE tools.
- LangChain is extra orchestration. We already call Grok as JSON.

Later, the only corpus worth embedding is **this user’s meals and rejections**.

### System shape (1M users)

```
Browser  →  Next.js (stateless)
              ├─ GET  /api/coach/today     Postgres projection only. Redis 60s.
              ├─ POST /api/coach/checkin   event + project. No LLM.
              ├─ POST /api/coach/interview parse / questions / options (Grok, rate-limited)
              └─ GET  /api/coach/review    SQL aggregates + templates. Cached per week.

Postgres  coach_* tables, RLS, keyed by user_id
Redis     today board, AI rate limit, current plan cache (already exists)
Grok      parse food/photo, 3 swap options. Never the weekly verdict.
```

**Scale rules**

| Rule | Why |
|---|---|
| One row per user per day (`coach_daily`) and per slot (`coach_slots`) | Hot path is a handful of rows, not a JSON blob of the week |
| Append-only `coach_events` | Audit, replay, idempotency. Board does not scan the event log |
| Interviews expire in 30 minutes | No unbounded chat threads |
| Idempotency key on events | Double-taps at the edge |
| Grok rate-limited per user | Protects cost at 1M |
| No LLM on GET | Horizontal read scale |
| Partition mentally by `user_id` | Later: hash-partition `coach_events`, move Grok to a queue (Inngest/SQS). Sync Grok with timeout is OK until that traffic |

Week-1 diet/workout JSON stays in `diet_plans` / `workout_plans`. The coach **copies today’s slots** out of that JSON. Slot repair writes the cell back so `/diet/plan` stays in sync.

### Phases we will add later (not this slice)

- Queue for Grok, multi-region Postgres.
- Progress photos + waist as first-class measurement cadence.
- Full logbook (sets) only for people who train without us in the room — not the default Today UI.
- Diet-break / deload as an explicit phase switch.
- Personal RAG of rejected/accepted meals.

---

## 5. LLD (low level)

### Tables (`supabase/schema/11_coach.sql`)

- `coach_profiles` — 1/user: goal, phase (`onboarding|block|diet_break|maintenance`), targets, plan ids.
- `coach_slots` — unique `(user_id, date, kind, slot_key)`. Kind `meal|session`. Status `planned|as_planned|replaced|ate_other|skipped|done`. Budgets + actuals.
- `coach_events` — append-only. Optional `client_event_id` unique per user.
- `coach_preferences` — append-only facts (`dislike:paneer`, `cook:weeknight=no`). Latest key wins in app code.
- `coach_interviews` — open question state, draft parse, options, `expires_at`.
- `coach_daily` — surplus, extra steps, carry-over, attendance rolls.
- `coach_measurements` — waist / photo every 2–4 weeks.
- `coach_week_reviews` — one row per Monday. Templates, not Grok.

All RLS: own rows only. Indexes `(user_id, date)`.

### Slot contract

A meal slot is not a GPT dish name. It is:

`lunch / 2026-09-04 / ~550 kcal / ≥35 g protein / veg / 15 min`

A session slot is:

`session / Tuesday / push / 45 min / dumbbells`

Repair stays inside that contract unless the person explicitly spends another slot (steal from dinner) or walks the surplus.

### Check-in API (no LLM)

`POST /api/coach/checkin`

- `meal` + `as_planned` → actual = budget, status `as_planned`
- `session` + `done` + `feel` (`easy|right|too_hard`)
- `session` + `skipped`
- `vitals` weight / sleep / energy / extra steps done
- `measurement` waist

Each writes an event, then re-projects `coach_slots` + `coach_daily`.

### Interview API (LLM, 2–3 questions max)

`POST /api/coach/interview` `{ date, slot_key, kind: meal_other|meal_dislike|session_dislike, text?, image? }`

1. Parse (Grok JSON): food name, category, kcal band, `unknowns[]`.
2. Question bank in code picks at most 3 chips from unknowns (portion, butter, sauce, drink, why-dislike, time available).
3. `POST .../answer` stores chip values (`FormSelect`).
4. `POST .../complete` applies **adders in code** (heavy butter, extra pav, cola). Then:
   - `meal_other` → surplus, extra steps, copy, maybe carry-over flag.
   - `meal_dislike` → Grok returns 3 options inside budget; user picks; slot replaced; preference saved; diet JSON cell patched.

### Ledger (deterministic)

- ~0.045 kcal / walking step. Surplus → extra steps, rounded to 50.
- Unpaid surplus at next day’s ensure → reduce the largest still-`planned` meal (floor 200 kcal).
- Goal delay days ≈ unpaid kcal / 500 for fat-loss (honest, not scary).
- Clamp daily targets 1400–4500 if we ever change the day total.

### Weekly review (deterministic)

Inputs: 7-day attendance, meal follow-through, weekly weight average vs prior week, waist if present, goal.

- Low attendance → `fix_schedule`
- Fat-loss, high adherence, ~21 days, scale **and** waist quiet → `extra_steps` or `smaller_meal`
- Lifts/feel down + low sleep → `eat_more` / `deload` (copy only in v1)
- Else `hold`

No `calorie_stall_14d`. No −200 on the whole plan.

### UI

- Route stays `/progress` (signed-in home). Nav label: Coach.
- Theme tokens: `--color-fyte-ink #282828`, page `gray-50`, white `rounded-2xl` cards, `rounded-xl` chip buttons.
- Fields: existing `FormSelect` chips, `FormInput`, `FormTextarea`, `MotionButton`. No new visual language.
- Today: meals, session, check-in (weight, sleep, energy), extra-steps card, this-week review, calendar.
- **No per-set logger on Today.**

### Failure

If `11_coach.sql` is not pasted, Today explains that. Diet/workout generate still works; coach seed is best-effort after save.

---

## 6. Implement now vs later

**This slice**

- Schema + projection + Today UI
- As planned / skipped / done + feel
- Ate something else: text or photo → questions → ledger
- Don’t like this meal: questions → 3 options in budget → replace cell + memory
- Weekly hold / extra-steps / smaller-meal templates
- Shared theme tokens and form controls

**Next slices**

- Session “don’t like” → replacement workout in time budget
- Waist + photos cadence UI
- Explicit diet-break phase
- Grok job queue
- Set logbook as an *optional* advanced surface

## 7. Accuracy and scale: what we add, in order

No new framework. Each item below is a table, a job, or a metric.

**Accuracy (what makes the coach trusted)**

1. `food_items` reference table (IFCT 2017 for Indian food, USDA FDC for the rest): name, portion unit, kcal, protein per portion. Grok maps text/photo → item + portion; the number comes from the table, not the model. Fallback to Grok estimate only when no match.
2. Eval set: 100 real meals with known kcal (weighed). Run every prompt change; ship only if median error stays under 15%.
3. Ranges, not points: show “~450–550 kcal” and ask one question only when the range changes the action.
4. Weekly weight trend (7-day average) decides plan changes, never a single weigh-in.

**Scale (what keeps 1M users cheap)**

1. `/coach/today` read is one indexed query per table + Redis; no LLM on read. Target p95 < 150 ms.
2. Grok calls go through a queue (QStash or Inngest) with per-user daily cap; the UI gets the result by polling the interview row.
3. Postgres via Supavisor pooling; `coach_events` partitioned by month once it passes 50M rows.
4. Sentry for errors, PostHog for the three product numbers: day‑7 check‑in rate, meals answered per day, weekly review opened.

**What sells (paywall placement)**

- Free: plan generation + “as planned / skipped” buttons.
- Paid: photo + “something else” interview, swaps, weekly review, and the honest delay‑days number. That is the trainer; that is what people pay a human for.
