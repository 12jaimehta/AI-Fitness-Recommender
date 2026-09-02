# What we are building now

Fyte AI already generates a diet and a workout. That is not enough to charge a stranger. A one-shot plan is a demo. The product is **what happens after they log**.

This file is the current bet. Marketplace (Fyte Connect) is parked until checkout actually works.

## Why people will not pay yet

They can get a meal list or a split from ChatGPT in two minutes. We only become worth money if the app **changes the plan from their week**, without sending them through the form again.

## The three bets

### 1. Week 2 comes from this week’s logs, not another form

First plan: form → generate → save.

Every week after that: reuse the saved form (preferences, allergies, equipment, goal) plus the last ~7 days of meals, sessions, and weight. One button on Tracking. Same result screen and skeleton as first generate. No empty form.

### 2. Tracking is the home screen. Generation is a button, not the product

Signed-in home is **Tracking** (`/progress`), not the dashboard.

Daily logging is the product. Charts roll up those logs. “Make a diet / make a workout” is how you start. “Build next week from this week’s logs” is how you continue.

### 3. One paid promise — then actually do it

**We adjust calories when weight stalls for 14 days.**

That means:

- Detect a stall from weigh-ins spanning at least 14 days (move less than ~0.5 kg).
- On the next week’s diet, **cut ~200 kcal** (clamped 1400–4500). Not a coach sentence only.
- Do not deepen the deficit for Hyrox, Ironman, or running. Those goals stay fueled.

Copy on Tracking states the promise in those words.

## Marketplace (paused)

Fyte Connect (trainers, checkout, creators) is hidden from nav and footer. Those URLs redirect to Tracking. API and page code stay in the repo so we can turn it back on after checkout is real.

## UI

Keep the existing theme while we ship this: `bg-gray-50` pages, `#282828` primary buttons, white `rounded-2xl` cards, gray-50 inner panels, `#282828` type.

## What “done” looks like for this slice

- After sign-in (profile complete), you land on Tracking.
- Trainers is gone from the chrome.
- With no plan: buttons to the diet / workout forms.
- With a plan: a button builds next week from logs and opens the plan screen.
- If weight has not moved for 14 days on a fat-loss plan, next week’s calorie target is actually lower.
