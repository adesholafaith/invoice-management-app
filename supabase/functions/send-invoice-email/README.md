# Send Invoice Email

Sends a customer-facing invoice email through Resend for the signed-in user's invoice.

Required Supabase secrets:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxx
supabase secrets set FROM_EMAIL="Ledgerly <invoices@yourdomain.com>"
supabase secrets set APP_URL=https://your-deployed-app.com
```

Deploy:

```bash
supabase functions deploy send-invoice-email
```
