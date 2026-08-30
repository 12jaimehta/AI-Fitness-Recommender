# FyteAI keys

Paste values into `.env` (never commit `.env`). Copy `.env.example` first.

```bash
cp .env.example .env
```

---

## Required

| Key | Where to get it | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL | Auth, database, storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` | Browser + server (RLS) |
| `XAI_API_KEY` | [xAI console](https://console.x.ai/) → API keys | Diet + workout generation (Grok) |

## Optional

| Key | Where to get it | Used by |
| --- | --- | --- |
| `GROK_MODEL` | Model id, default `grok-4.6` | AI generation. Cheaper option: `grok-4.3` |
| `XAI_BASE_URL` | Default `https://api.x.ai/v1` | Grok API host |
| `RESEND_API_KEY` | [Resend](https://resend.com/api-keys) | Diet plan emails. If empty, send is simulated |
| `EMAIL_FROM` | Verified sender, e.g. `FyteAI <noreply@fyteai.co.in>` | From address |

---

## `.env` template

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

XAI_API_KEY=
GROK_MODEL=grok-4.6

RESEND_API_KEY=
EMAIL_FROM=FyteAI <noreply@fyteai.co.in>
```

---

## Database

Paste the numbered files in `supabase/schema/` into the SQL Editor. Start with `00_extensions_and_helpers.sql`. See `supabase/README.md` for order.

That creates tables, RLS, storage buckets, and a profile row on signup.

Auth → URL configuration:

- Site URL: `http://localhost:3000`
- Redirect URLs: `/auth/callback`, `/sign-in`, `/sign-up`
