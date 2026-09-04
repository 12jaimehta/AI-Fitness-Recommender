-- =============================================================================
-- 12_billing.sql
-- Paste AFTER: 11_coach.sql
-- 30-day Coach pass (Razorpay). Safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  period_days INTEGER NOT NULL CHECK (period_days > 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  billing_plan_id UUID NOT NULL REFERENCES public.billing_plans(id),
  razorpay_order_id TEXT NOT NULL UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount_paise INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  method TEXT CHECK (method IS NULL OR method IN ('upi', 'card')),
  status TEXT NOT NULL DEFAULT 'created'
    CHECK (status IN ('created', 'paid', 'failed', 'refunded')),
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS payments_user_created
  ON public.payments (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'none'
    CHECK (status IN ('none', 'active', 'past_due', 'canceled')),
  current_period_end TIMESTAMPTZ,
  last_payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_memberships_updated_at ON public.memberships;
CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS billing_plans_read ON public.billing_plans;
DROP POLICY IF EXISTS payments_own_read ON public.payments;
DROP POLICY IF EXISTS payments_own_insert ON public.payments;
DROP POLICY IF EXISTS memberships_own_read ON public.memberships;

CREATE POLICY billing_plans_read ON public.billing_plans
  FOR SELECT USING (active = true);

CREATE POLICY payments_own_read ON public.payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY payments_own_insert ON public.payments
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text
    AND status = 'created'
  );

CREATE POLICY memberships_own_read ON public.memberships
  FOR SELECT USING (auth.uid()::text = user_id::text);

INSERT INTO public.billing_plans (slug, name, amount_paise, currency, period_days, active)
VALUES ('coach-30', 'Coach', 29900, 'INR', 30, true)
ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name,
      amount_paise = EXCLUDED.amount_paise,
      period_days = EXCLUDED.period_days,
      active = true;
