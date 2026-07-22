import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
const fromEmail = Deno.env.get('FROM_EMAIL') ?? ''
const appUrl = Deno.env.get('APP_URL') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !resendApiKey || !fromEmail) {
    return jsonResponse({ error: 'Email sending is not configured' }, 500)
  }

  if (!resendApiKey.startsWith('re_')) {
    return jsonResponse(
      {
        error:
          'Resend API key is invalid. Set RESEND_API_KEY to a valid key from Resend, then redeploy this function.',
      },
      500,
    )
  }

  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401)
  }

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  })

  const {
    data: { user },
    error: userError,
  } = await authClient.auth.getUser()

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { invoiceId } = await request.json()

  if (!invoiceId) {
    return jsonResponse({ error: 'Invoice ID is required' }, 400)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: subscription, error: subscriptionError } = await adminClient
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle()

  if (subscriptionError) {
    return jsonResponse({ error: 'Unable to verify subscription' }, 500)
  }

  if (!isPremiumSubscription(subscription)) {
    return jsonResponse({ error: 'Subscribe to send invoice emails.' }, 403)
  }

  const { data: invoice, error: invoiceError } = await adminClient
    .from('invoices')
    .select(
      `
        id,
        user_id,
        invoice_number,
        status,
        issue_date,
        due_date,
        currency,
        subtotal,
        tax_amount,
        discount,
        total,
        notes,
        customers!invoices_customer_id_fkey (
          name,
          email,
          company,
          billing_address
        ),
        invoice_items!invoice_items_invoice_id_fkey (
          description,
          quantity,
          unit_price,
          line_total,
          position
        )
      `,
    )
    .eq('id', invoiceId)
    .eq('user_id', user.id)
    .single()

  if (invoiceError || !invoice) {
    return jsonResponse({ error: 'Invoice not found' }, 404)
  }

  if (!invoice.customers?.email) {
    return jsonResponse({ error: 'Customer email is required' }, 400)
  }

  const { data: profile } = await adminClient
    .from('profiles')
    .select('company_name, contact_name, email, phone, address, website, tax_id, invoice_footer')
    .eq('user_id', user.id)
    .maybeSingle()

  const response = await fetch('https://api.resend.com/emails', {
    body: JSON.stringify({
      from: fromEmail,
      html: buildInvoiceEmail(invoice, profile),
      subject: `Invoice ${invoice.invoice_number} from ${profile?.company_name || 'Ledgerly'}`,
      to: invoice.customers.email,
    }),
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const resendMessage = normalizeResendError(payload)
    return jsonResponse({ error: resendMessage }, 400)
  }

  await adminClient.from('invoice_activities').insert({
    invoice_id: invoice.id,
    label: 'Invoice emailed',
    type: 'emailed',
    user_id: user.id,
  })

  return jsonResponse({ id: payload.id })
})

function buildInvoiceEmail(invoice: Invoice, profile: Profile | null) {
  const invoiceUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/invoices/${invoice.id}` : ''
  const rows = [...invoice.invoice_items]
    .sort((left, right) => Number(left.position) - Number(right.position))
    .map(
      (item) => `
        <tr>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(item.description)}</td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;">${Number(item.quantity)}</td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;">${formatCurrency(item.unit_price, invoice.currency)}</td>
          <td style="padding:12px;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(item.line_total, invoice.currency)}</td>
        </tr>
      `,
    )
    .join('')

  return `
    <div style="font-family:Arial,sans-serif;color:#0f172a;line-height:1.5;">
      <h1 style="margin:0 0 8px;font-size:24px;">Invoice ${escapeHtml(invoice.invoice_number)}</h1>
      <p style="margin:0 0 24px;color:#475569;">
        ${escapeHtml(profile?.company_name || profile?.contact_name || 'Your service provider')} sent you an invoice for
        <strong>${formatCurrency(invoice.total, invoice.currency)}</strong>.
      </p>

      <div style="margin-bottom:24px;">
        <p style="margin:0;"><strong>Due:</strong> ${escapeHtml(invoice.due_date)}</p>
        <p style="margin:0;"><strong>Status:</strong> ${escapeHtml(invoice.status)}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;">
        <thead>
          <tr style="background:#f8fafc;">
            <th align="left" style="padding:12px;border-bottom:1px solid #e2e8f0;">Description</th>
            <th align="left" style="padding:12px;border-bottom:1px solid #e2e8f0;">Qty</th>
            <th align="left" style="padding:12px;border-bottom:1px solid #e2e8f0;">Unit price</th>
            <th align="right" style="padding:12px;border-bottom:1px solid #e2e8f0;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top:24px;text-align:right;">
        <p style="margin:0;">Subtotal: ${formatCurrency(invoice.subtotal, invoice.currency)}</p>
        <p style="margin:0;">Tax: ${formatCurrency(invoice.tax_amount, invoice.currency)}</p>
        <p style="margin:0;">Discount: ${formatCurrency(-invoice.discount, invoice.currency)}</p>
        <p style="margin:8px 0 0;font-size:20px;"><strong>Total: ${formatCurrency(invoice.total, invoice.currency)}</strong></p>
      </div>

      ${
        invoiceUrl
          ? `<p style="margin-top:24px;"><a href="${invoiceUrl}" style="color:#0e7490;">View invoice</a></p>`
          : ''
      }

      ${
        profile?.invoice_footer
          ? `<p style="margin-top:24px;color:#475569;white-space:pre-line;">${escapeHtml(profile.invoice_footer)}</p>`
          : ''
      }
    </div>
  `
}

function normalizeResendError(payload: Record<string, unknown>) {
  const message = String(payload.message || payload.error || '')

  if (message.toLowerCase().includes('api key is invalid')) {
    return 'Resend API key is invalid. Create a new Resend API key, set RESEND_API_KEY in Supabase secrets, and redeploy send-invoice-email.'
  }

  return message || 'Unable to send invoice email'
}

function isPremiumSubscription(subscription: Subscription | null) {
  if (!subscription || !['active', 'non-renewing'].includes(subscription.status)) {
    return false
  }

  if (!subscription.current_period_end) {
    return true
  }

  return new Date(subscription.current_period_end) > new Date()
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

function formatCurrency(value: number | string, currency: string) {
  return new Intl.NumberFormat('en-US', {
    currency,
    style: 'currency',
  }).format(Number(value || 0))
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

type Invoice = {
  currency: string
  customers: {
    email?: string
  }
  discount: number
  due_date: string
  id: string
  invoice_items: Array<{
    description: string
    line_total: number
    position: number
    quantity: number
    unit_price: number
  }>
  invoice_number: string
  status: string
  subtotal: number
  tax_amount: number
  total: number
}

type Profile = {
  company_name?: string
  contact_name?: string
  invoice_footer?: string
}

type Subscription = {
  current_period_end?: string | null
  status?: string | null
}
