# Paystack Checkout

Starts a Paystack subscription checkout for the signed-in user.

Required Supabase secrets:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_live_or_test_key
supabase secrets set PAYSTACK_MONTHLY_PLAN_CODE=PLN_monthly
supabase secrets set PAYSTACK_YEARLY_PLAN_CODE=PLN_yearly
```

Deploy:

```bash
supabase functions deploy paystack-checkout
supabase functions deploy paystack-webhook --no-verify-jwt
```
