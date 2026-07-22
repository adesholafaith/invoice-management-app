import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY') ?? ''

const planCodes: Record<string, string | undefined> = {
  monthly: Deno.env.get('PAYSTACK_MONTHLY_PLAN_CODE'),
  yearly: Deno.env.get('PAYSTACK_YEARLY_PLAN_CODE'),
}

const planAmounts: Record<string, number> = {
  monthly: 99900,
  yearly: 1000000,
}

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

  const authHeader = request.headers.get('Authorization')

  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization header' }, 401)
  }

  if (!supabaseUrl || !supabaseAnonKey || !paystackSecretKey) {
    return jsonResponse({ error: 'Checkout is not configured' }, 500)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
  } = await supabase.auth.getUser()

  if (userError || !user?.email) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  const { plan } = await request.json()
  const planCode = planCodes[plan]
  const amount = planAmounts[plan]

  if (!planCode || !amount) {
    return jsonResponse({ error: 'Invalid or unconfigured plan' }, 400)
  }

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    body: JSON.stringify({
      amount,
      currency: 'NGN',
      email: user.email,
      metadata: {
        plan,
        user_id: user.id,
      },
      plan: planCode,
    }),
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const payload = await response.json()

  if (!response.ok || !payload.status) {
    return jsonResponse(
      { error: payload.message || 'Unable to initialize Paystack checkout' },
      400,
    )
  }

  return jsonResponse({
    access_code: payload.data.access_code,
    authorization_url: payload.data.authorization_url,
    reference: payload.data.reference,
  })
})

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}
