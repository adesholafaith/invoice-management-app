# Paystack Webhook

Verifies Paystack webhook signatures and updates the user's subscription after successful payment
and subscription lifecycle events.

Required Supabase secrets:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_or_test_key
supabase secrets set PAYSTACK_MONTHLY_PLAN_CODE=PLN_monthly
supabase secrets set PAYSTACK_YEARLY_PLAN_CODE=PLN_yearly
```

Deploy:

```bash
supabase functions deploy paystack-webhook --no-verify-jwt
```

Add this webhook URL in Paystack:

```text
https://YOUR_PROJECT_REF.functions.supabase.co/paystack-webhook
```
