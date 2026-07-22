import { supabase } from '../config/supabaseClients'

export const billingService = {
  async startCheckout(plan) {
    const { data, error } = await supabase.functions.invoke('paystack-checkout', {
      body: { plan },
    })

    if (error) {
      const message = await getFunctionErrorMessage(error)
      throw new Error(message)
    }

    return data
  },
}

async function getFunctionErrorMessage(error) {
  if (error.context?.json) {
    try {
      const payload = await error.context.clone().json()
      return payload.error || error.message || 'Unable to start checkout.'
    } catch {
      return error.message || 'Unable to start checkout.'
    }
  }

  return error.message || 'Unable to start checkout.'
}
