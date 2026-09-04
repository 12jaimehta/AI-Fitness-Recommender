# Payments (UPI + card)

Plan for charging Fyte AI in India. **Do not implement until this doc is agreed.** Marketplace (Fyte Connect) stays paused. The fake “Buy plan” insert in Connect is not a payment system.

Today: no real money path. Connect checkout writes `plan_purchases` with no gateway. Help/FAQs still mention PayPal. That is wrong for what we will ship.

## What we are selling

Charge for the **membership** that makes the coach worth money, not for a one-shot diet form. Product spec: [`COACH.md`](COACH.md).

| Free | Paid (membership) |
| --- | --- |
| Account, profile, first diet, first workout | Daily coach: slot repair, trainer questions, carry-over |
| Check-in (meals as planned, session done/skipped, weight, sleep) | Photo / “I ate something else” → walk or next-day meal |
| | Weekly review from attendance + weekly weight average |

Copy on `/billing` should match Coach: **“We watch the week and change the meal or session that slipped.”** Do not explain logs, forms, or internals.

Fyte Connect trainer checkout is a later product. Do not mix Connect SKUs with membership.

## Methods

**Only UPI and cards** (credit / debit / RuPay). No netbanking, wallets, EMI, PayPal, Apple Pay, or pay-later.

UPI is how most people in India will pay. Cards cover the rest and are what recurring billing can actually use later.

## Provider: Razorpay

Use **Razorpay** (Standard Checkout).

- UPI (Collect, Intent, QR) and cards in one checkout.
- INR, Indian KYC, settlements to an Indian bank.
- Method filters so we can turn off everything except `upi` and `card`.
- Webhooks we can verify.

Cashfree is a fine backup if Razorpay KYC stalls. Stripe India also does UPI + cards; more overhead for a first India checkout. Do not use PayPal.

## Billing model (phased)

### Phase 1 — 30-day pass (ship this)

One Razorpay **order**. User pays with UPI or card. We grant membership until `current_period_end` (now + 30 days). They pay again when it lapses.

Why not a real subscription on day one: **UPI Autopay / e-mandate is slow and drop-off heavy.** Cards can recur; UPI often cannot without extra RBI steps. A 30-day pass works for both methods with the same code.

### Phase 2 — auto-renew (after Phase 1 is live)

- **Cards:** Razorpay Subscriptions.
- **UPI:** Razorpay UPI Autopay only after Phase 1 is stable.
- Keep the 30-day pass as a fallback.

Pick **one price in INR** before coding (example to decide, not a commitment: ₹199–₹499 / 30 days). Show ₹ on the site, store **paise** in the database.

GST: register when required; Razorpay can add GST invoices later. Do not block Phase 1 on GSTIN if you are still under the threshold, but do not advertise tax-inclusive invoices until you can issue them.

## Architecture

Never trust the browser. The client can say “payment success.” Only a **verified webhook** (or a server-side payment fetch) may grant access.

```
App  →  POST /api/billing/order     create Razorpay order (amount, user, receipt)
     ←  { orderId, keyId, amount }

App  →  Razorpay Checkout           method: upi | card only
     ←  razorpay_payment_id + signature (client)

App  →  POST /api/billing/verify    optional fast path: verify signature, still wait for webhook

Razorpay → POST /api/billing/webhook
           HMAC of body with RAZORPAY_WEBHOOK_SECRET
           event payment.captured → mark payment paid, set membership period
```

Idempotency: `razorpay_order_id` and `razorpay_payment_id` unique. Webhooks retry; handling the same event twice must not double the period.

Grok generate stays 30–120s. Do not put payment and generate in one request.

## Data

New SQL (suggested `supabase/schema/11_billing.sql`):

```text
billing_plans
  id, name, amount_paise, currency (INR), period_days, active

payments
  id, user_id, billing_plan_id
  razorpay_order_id unique, razorpay_payment_id unique null
  amount_paise, currency, method (upi | card | null)
  status (created | paid | failed | refunded)
  raw jsonb, created_at, paid_at

memberships
  user_id primary key
  status (none | active | past_due | canceled)
  current_period_end timestamptz
  last_payment_id
```

Server helper: `hasActiveMembership(userId)` → `status = active` and `current_period_end > now()`.

Gate **writes that cost money**, not Tracking itself:

- `POST /api/generate-diet/from-logs`
- `POST /api/generate-workout/from-logs`
- Stall calorie apply lives inside from-logs, so it is gated with that.

Keep first generate (`/api/generate-diet`, `/api/generate-workout`) and all logging free.

## App surfaces

Theme stays `bg-gray-50`, `#282828` buttons, white `rounded-2xl` cards.

| Surface | Behaviour |
| --- | --- |
| `/billing` | Promise, price in ₹, **Pay with UPI or card**, then Razorpay. Success → Tracking. |
| Tracking “Update diet / workout” | If membership inactive → `/billing`, not the generate overlay. |
| Coach “Update diet” | Same gate. |
| Profile or account | Period end, “Pay again”, later cancel (Phase 2). |
| `/progress` promise card | No prices stuffed into the calendar. CTA can say “Membership” once billing exists. |

Checkout options (Razorpay):

```text
method: { upi: true, card: true, netbanking: false, wallet: false, emi: false, paylater: false }
prefill: email, name from profile
theme.color: #282828
```

## Env and keys

Add to `keys.md` / Vercel when implementing. Never commit secrets.

| Key | Where |
| --- | --- |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Browser Checkout |
| `RAZORPAY_KEY_SECRET` | Server: create order, verify |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook HMAC |

Local: Razorpay test keys + a tunnel (or Vercel preview) so webhooks hit `/api/billing/webhook`. Test UPI and test cards from Razorpay’s docs. Live keys only after KYC + a ₹1 live UPI and a live card test.

`src/proxy.ts` already skips auth on `/api/*`. Webhook must **not** use the user cookie; it authenticates with the webhook secret.

## Implementation order

1. **Decide price and period** (INR, 30 days). One SKU.
2. **Razorpay account** — test mode, enable UPI + cards, disable other methods in the dashboard too.
3. **Schema `11_billing.sql`** — paste in Supabase; RLS: users read own payments/membership; **no client inserts**. Service/server uses user session only to create orders; webhook uses a privileged update path (service role or a locked RPC).
4. **Backend** — `createOrder`, `verifySignature`, `handleWebhook`. Package: `razorpay` (official). Amounts in paise.
5. **`/billing` page** — membership copy + pay button. Load Checkout.js only on that page.
6. **Gate from-logs APIs** — 402 or redirect payload if `!hasActiveMembership`.
7. **Tracking / Coach CTAs** — send unpaid users to `/billing`.
8. **Legal copy** — Help FAQ billing (drop PayPal), Terms payment section, Privacy (Razorpay as processor). Refund rule: pick one and print it (e.g. no prorated refund on a 30-day pass, or 7-day first-purchase refund). Do not keep “30-day money-back” in FAQs unless you will honour it.
9. **Test** — test UPI, test card success, test card failure, webhook replay, expired membership blocked on from-logs, logging still free.
10. **Live** — KYC, live webhook URL, one real UPI, one real card, then turn on the gate.

Phase 2 (later): Razorpay Subscriptions for cards, Autopay for UPI, invoices, GST.

## Out of scope for Phase 1

- Connect / trainer payouts
- Promo codes (can add a single `discount_paise` later)
- International currency
- Apple/Google IAP
- Metered Grok usage billing

## Done when

- A signed-in user can pay **₹X by UPI or card** and get 30 days of membership.
- From-logs and stall calorie apply work only while membership is active.
- First generate and daily logging work without paying.
- Webhook is the source of truth; refreshing `/billing` cannot grant access.
- FAQs/Terms no longer mention PayPal or “all major methods.”
