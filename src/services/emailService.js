import { supabase } from '../config/supabaseClients'

export const emailService = {
  async sendInvoice(invoiceId) {
    const { data, error } = await supabase.functions.invoke('send-invoice-email', {
      body: { invoiceId },
    })

    if (error) {
      const message = await getFunctionErrorMessage(error)
      return { data: null, error: new Error(message) }
    }

    return { data, error: null }
  },
}

async function getFunctionErrorMessage(error) {
  if (error.context?.json) {
    try {
      const payload = await error.context.clone().json()
      return normalizeEmailError(payload.error || error.message)
    } catch {
      return normalizeEmailError(error.message)
    }
  }

  return normalizeEmailError(error.message)
}

function normalizeEmailError(message) {
  if (message?.toLowerCase().includes('api key is invalid')) {
    return 'Resend API key is invalid. Add a valid RESEND_API_KEY to Supabase secrets and redeploy the send-invoice-email function.'
  }

  return message || 'Unable to send invoice email.'
}
