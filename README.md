# Billing Invoice Management System

Billing is a production-style invoice management SaaS built with React, Tailwind CSS, Supabase, Paystack, jsPDF, and Resend. It supports authentication, client management, invoice CRUD, line-item calculations, PDF export, paid-plan gating, and invoice email sending.

## Features

- Supabase email/password authentication
- Protected dashboard and app routes
- Client CRUD
- Invoice CRUD, duplication, status updates, search, and filters
- Unlimited invoice line items with subtotal, tax, discount, and total calculations
- Dashboard metrics for total, paid, pending, overdue invoices, revenue, and recent invoices
- Company profile settings that appear on invoices, PDFs, and invoice emails
- PDF download and browser print for subscribed users
- Paystack checkout and webhook-backed subscriptions
- Resend-powered invoice email sending
- AI assistant powered through a Supabase Edge Function
- Loading, empty, error, toast, and confirmation states

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- Supabase Auth, PostgreSQL, REST API, and Edge Functions
- React Hook Form
- React Hot Toast
- React Icons
- jsPDF
- Paystack
- Resend
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Add your public Supabase values:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_publishable_or_anon_key
VITE_API_BASE_URL=https://your-project-ref.supabase.co/rest/v1/
```

Run the app:

```bash
npm run dev
```

## Supabase Setup

Log in and link your project:

```bash
supabase login --token your_access_token
supabase link --project-ref your_project_ref
```

Apply the database schema:

```bash
supabase db query --linked --file supabase/schema.sql
```

The schema creates:

- `clients`
- `invoices`
- `invoice_items`
- `profiles`
- `subscriptions`
- RLS policies for user-owned data
- ownership constraints for invoices and invoice items
- auth trigger defaults for profiles and subscriptions

## Edge Function Secrets

Set Paystack subscription secrets:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_or_test_key
supabase secrets set PAYSTACK_MONTHLY_PLAN_CODE=PLN_monthly
supabase secrets set PAYSTACK_YEARLY_PLAN_CODE=PLN_yearly
```

Set email sending secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set FROM_EMAIL="Billing <invoices@billing.app>"
supabase secrets set APP_URL=https://your-deployed-app.com
```

Set AI assistant secrets:

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
supabase secrets set GEMINI_MODEL=gemini-3.5-flash
```

Deploy Edge Functions:

```bash
supabase functions deploy paystack-checkout
supabase functions deploy paystack-webhook --no-verify-jwt
supabase functions deploy send-invoice-email
supabase functions deploy ledgerly-ai-chat
```

## Paystack Setup

Create two Paystack plans:

- Monthly: NGN 1000
- Yearly: NGN 10,000

Copy their plan codes into Supabase secrets:

```bash
supabase secrets set PAYSTACK_MONTHLY_PLAN_CODE=PLN_xxxxx
supabase secrets set PAYSTACK_YEARLY_PLAN_CODE=PLN_xxxxx
```

Add this webhook URL in Paystack:

```text
https://YOUR_PROJECT_REF.functions.supabase.co/paystack-webhook
```

Recommended events:

- `charge.success`
- `invoice.update`
- `subscription.create`
- `subscription.not_renew`
- `subscription.disable`

## Email Setup

Billing uses Resend from the `send-invoice-email` Supabase Edge Function. Verify your sending domain in Resend, then set `FROM_EMAIL` to an address on that domain.

Example:

```bash
supabase secrets set FROM_EMAIL="Billing <invoices@billing.app>"
```

## AI Assistant Setup

Billing uses the `ledgerly-ai-chat` Supabase Edge Function for AI chat. The browser sends the user's message to Supabase, and the Edge Function calls Gemini with `GEMINI_API_KEY`, so the secret key is never exposed in frontend code.

Use a Gemini API key from Google AI Studio. The default model is `gemini-3.5-flash`, which is a good free-tier-friendly starting point for a support assistant. If the free tier is rate-limited, the assistant will show a temporary availability message instead of exposing raw provider errors to users.

Deploy after setting the AI secrets:

```bash
supabase functions deploy ledgerly-ai-chat
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run preview
```

## Deployment

Deploy the frontend to Vercel, Netlify, or another static hosting provider. Set the same public environment variables in the hosting dashboard:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL
```

Keep all Paystack, Resend, Gemini, and service-role secrets in Supabase Edge Function secrets only. Do not expose them to the browser.

## Security Notes

- RLS is enabled on user-owned tables.
- Supabase service role keys are only used inside Edge Functions.
- Paystack webhook signatures are verified before subscription updates.
- Invoice ownership is enforced at the database level.
- PDF and print actions are gated by subscription status.
