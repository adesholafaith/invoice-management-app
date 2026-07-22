import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
})

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature') ?? ''

  if (!paystackSecretKey || !serviceRoleKey || !supabaseUrl) {
    return jsonResponse({ error: 'Webhook is not configured' }, 500)
  }

  const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecretKey)

  if (!isValid) {
    return jsonResponse({ error: 'Invalid signature' }, 401)
  }

  const event = JSON.parse(rawBody)

  try {
    await handlePaystackEvent(event)
    return jsonResponse({ received: true })
  } catch (error) {
    console.error('Paystack webhook failed:', error)
    return jsonResponse({ error: 'Webhook processing failed' }, 500)
  }
})

async function handlePaystackEvent(event: PaystackEvent) {
  switch (event.event) {
    case 'charge.success':
      await upsertSubscriptionFromCharge(event.data)
      break
    case 'invoice.update':
      await updateSubscriptionFromInvoice(event.data)
      break
    case 'subscription.create':
      await upsertSubscriptionFromSubscription(event.data, 'active')
      break
    case 'subscription.not_renew':
      await upsertSubscriptionFromSubscription(event.data, 'non-renewing')
      break
    case 'subscription.disable':
      await upsertSubscriptionFromSubscription(
        event.data,
        event.data?.status === 'complete' ? 'completed' : 'cancelled',
      )
      break
    default:
      break
  }
}

async function upsertSubscriptionFromCharge(data: PaystackData) {
  const subscription = data.subscription
  const planCode = getPlanCode(data)
  const userId = await resolveUserId(data)

  if (!userId) return

  await upsertSubscription(userId, {
    current_period_end: subscription?.next_payment_date ?? data.paid_at ?? null,
    last_payment_reference: data.reference ?? null,
    next_payment_date: subscription?.next_payment_date ?? null,
    paystack_authorization_code: data.authorization?.authorization_code ?? null,
    paystack_customer_code: data.customer?.customer_code ?? null,
    paystack_email_token: subscription?.email_token ?? null,
    paystack_plan_code: planCode,
    paystack_subscription_code: subscription?.subscription_code ?? null,
    plan: getPlanName(planCode),
    status: 'active',
  })
}

async function updateSubscriptionFromInvoice(data: PaystackData) {
  const subscriptionCode = data.subscription?.subscription_code

  if (!subscriptionCode) return

  const status = data.paid || data.status === 'success' ? 'active' : 'attention'

  const { error } = await supabase
    .from('subscriptions')
    .update({
      current_period_end: data.period_end ?? data.subscription?.next_payment_date ?? null,
      last_payment_reference: data.transaction?.reference ?? null,
      next_payment_date: data.subscription?.next_payment_date ?? null,
      status,
    })
    .eq('paystack_subscription_code', subscriptionCode)

  if (error) throw error
}

async function upsertSubscriptionFromSubscription(data: PaystackData, status: SubscriptionStatus) {
  const planCode = getPlanCode(data)
  const userId = await resolveUserId(data)

  if (!userId) return

  await upsertSubscription(userId, {
    current_period_end: data.next_payment_date ?? null,
    next_payment_date: data.next_payment_date ?? null,
    paystack_customer_code: data.customer?.customer_code ?? null,
    paystack_email_token: data.email_token ?? null,
    paystack_plan_code: planCode,
    paystack_subscription_code: data.subscription_code ?? null,
    plan: getPlanName(planCode),
    status,
  })
}

async function upsertSubscription(userId: string, values: SubscriptionUpdate) {
  const { error } = await supabase.from('subscriptions').upsert(
    {
      user_id: userId,
      ...values,
    },
    { onConflict: 'user_id' },
  )

  if (error) throw error
}

async function resolveUserId(data: PaystackData) {
  const metadataUserId = data.metadata?.user_id

  if (metadataUserId) {
    return metadataUserId
  }

  const customerCode = data.customer?.customer_code

  if (customerCode) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('paystack_customer_code', customerCode)
      .maybeSingle()

    if (subscription?.user_id) {
      return subscription.user_id
    }
  }

  const email = data.customer?.email || data.email

  if (!email) {
    return null
  }

  const { data: users, error } = await supabase.auth.admin.listUsers()

  if (error) throw error

  return users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null
}

function getPlanCode(data: PaystackData) {
  if (typeof data.plan === 'string') return data.plan
  return data.plan?.plan_code ?? data.subscription?.plan?.plan_code ?? null
}

function getPlanName(planCode: string | null): SubscriptionPlan {
  if (planCode && planCode === Deno.env.get('PAYSTACK_YEARLY_PLAN_CODE')) {
    return 'yearly'
  }

  if (planCode && planCode === Deno.env.get('PAYSTACK_MONTHLY_PLAN_CODE')) {
    return 'monthly'
  }

  return 'monthly'
}

async function verifyPaystackSignature(body: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { hash: 'SHA-512', name: 'HMAC' },
    false,
    ['sign'],
  )
  const digest = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')

  return timingSafeEqual(hash, signature)
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false

  let result = 0

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return result === 0
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}

type SubscriptionPlan = 'free' | 'monthly' | 'yearly'
type SubscriptionStatus = 'free' | 'active' | 'non-renewing' | 'attention' | 'completed' | 'cancelled'

type PaystackEvent = {
  event: string
  data: PaystackData
}

type PaystackData = {
  authorization?: {
    authorization_code?: string
  }
  customer?: {
    customer_code?: string
    email?: string
  }
  email?: string
  email_token?: string
  metadata?: {
    user_id?: string
  }
  next_payment_date?: string
  paid?: boolean
  paid_at?: string
  period_end?: string
  plan?:
    | string
    | {
        plan_code?: string
      }
  reference?: string
  status?: string
  subscription?: {
    email_token?: string
    next_payment_date?: string
    plan?: {
      plan_code?: string
    }
    subscription_code?: string
  }
  subscription_code?: string
  transaction?: {
    reference?: string
  }
}

type SubscriptionUpdate = {
  current_period_end?: string | null
  last_payment_reference?: string | null
  next_payment_date?: string | null
  paystack_authorization_code?: string | null
  paystack_customer_code?: string | null
  paystack_email_token?: string | null
  paystack_plan_code?: string | null
  paystack_subscription_code?: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
}
