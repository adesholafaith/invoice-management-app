import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const geminiApiKey = Deno.env.get('GEMINI_API_KEY') ?? ''
const geminiModel = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash'

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

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !geminiApiKey) {
    return jsonResponse({ error: 'Billing Assistant is not configured yet.' }, 500)
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

  const { messages } = await request.json().catch(() => ({ messages: [] }))
  const sanitizedMessages = sanitizeMessages(messages)

  if (!sanitizedMessages.length) {
    return jsonResponse({ error: 'Message is required.' }, 400)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
  const context = await buildUserContext(adminClient, user.id)

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    body: JSON.stringify({
      generation_config: {
        temperature: 0.3,
        thinking_level: 'low',
      },
      input: buildGeminiInput(sanitizedMessages),
      model: geminiModel,
      system_instruction: buildSystemPrompt(context),
    }),
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': geminiApiKey,
    },
    method: 'POST',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const normalizedError = normalizeGeminiError(payload)

    return jsonResponse({ error: normalizedError.message }, normalizedError.status)
  }

  const reply = extractGeminiText(payload)

  if (!reply) {
    return jsonResponse({ error: 'Billing Assistant could not generate a reply.' }, 500)
  }

  return jsonResponse({ reply })
})

async function buildUserContext(adminClient: SupabaseClient, userId: string) {
  const [{ data: profile }, { data: subscription }, { data: invoices }, { data: customers }] =
    await Promise.all([
      adminClient
        .from('profiles')
        .select('company_name, contact_name, preferred_currency')
        .eq('user_id', userId)
        .maybeSingle(),
      adminClient
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', userId)
        .maybeSingle(),
      adminClient
        .from('invoices')
        .select('invoice_number, status, due_date, total, currency')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(8),
      adminClient
        .from('customers')
        .select('name, company')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(8),
    ])

  return {
    customers: customers ?? [],
    invoices: invoices ?? [],
    profile,
    subscription,
  }
}

function buildGeminiInput(messages: ChatMessage[]) {
  return messages
    .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
    .join('\n\n')
}

function buildSystemPrompt(context: Record<string, unknown>) {
  return `
You are Billing Assistant, the in-app support assistant for Billing, a SaaS invoice management product.

Help users with Billing workflows: creating invoices, clients, payment terms, statuses, PDF export, printing, invoice email sending, receipts, billing, subscriptions, dashboard metrics, and account setup.

Rules:
- Be concise, calm, and practical.
- Give step-by-step instructions when useful.
- Use plain text with short numbered steps. Do not use Markdown bold, italics, tables, or escaped asterisks.
- If a feature requires a paid plan, say so clearly without sounding pushy.
- Do not invent tax, legal, accounting, or payment advice. Recommend checking with a qualified professional when needed.
- If the user asks for something outside Billing, answer briefly only if it helps them use the product.
- Never ask for secret keys, passwords, card details, or sensitive credentials.
- Use the user's context below only to personalize helpful product guidance.

User context:
${JSON.stringify(context, null, 2)}
`.trim()
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return []

  const sanitized: ChatMessage[] = []

  for (const message of messages.slice(-10)) {
    const record = message as { content?: unknown; role?: unknown }
    const role = record.role === 'assistant' ? 'assistant' : 'user'
    const content = String(record.content ?? '').trim().slice(0, 1200)

    if (content) {
      sanitized.push({ content, role })
    }
  }

  return sanitized
}

function extractGeminiText(payload: Record<string, unknown>) {
  const outputText = payload.output_text

  if (typeof outputText === 'string') {
    return outputText.trim()
  }

  const output = payload.output

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        const content = (item as { content?: unknown }).content

        if (!Array.isArray(content)) return []

        return content.map((part) => (part as { text?: unknown }).text).filter(Boolean)
      })
      .join('\n')
      .trim()
  }

  return collectTextValues(payload).join('\n').trim()
}

function collectTextValues(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectTextValues(item))
  }

  const record = value as Record<string, unknown>
  const values: string[] = []

  if (typeof record.output_text === 'string') {
    values.push(record.output_text)
  }

  if (typeof record.text === 'string') {
    values.push(record.text)
  }

  for (const [key, nestedValue] of Object.entries(record)) {
    if (key === 'system_instruction' || key === 'input') continue
    values.push(...collectTextValues(nestedValue))
  }

  return values.filter((text) => text.trim())
}

function normalizeGeminiError(payload: Record<string, unknown>) {
  const error = payload.error as { code?: number | string; message?: string; status?: string } | undefined
  const message = String(error?.message || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()
  const status = String(error?.status || '').toLowerCase()

  if (
    status.includes('resource_exhausted') ||
    code === '429' ||
    message.includes('quota') ||
    message.includes('rate limit')
  ) {
    return {
      message: 'Billing Assistant has reached its free AI limit for now. Please try again later.',
      status: 503,
    }
  }

  if (
    status.includes('unauthenticated') ||
    code === '401' ||
    code === '403' ||
    message.includes('api key')
  ) {
    return {
      message: 'Billing Assistant is not configured correctly yet.',
      status: 503,
    }
  }

  return {
    message: 'Billing Assistant is unavailable right now. Please try again shortly.',
    status: 503,
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  })
}

type ChatMessage = {
  content: string
  role: 'assistant' | 'user'
}

type SupabaseClient = ReturnType<typeof createClient>
