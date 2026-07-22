import { supabase } from '../config/supabaseClients'

const SUBSCRIPTION_COLUMNS =
  'id, user_id, plan, status, paystack_customer_code, paystack_subscription_code, paystack_email_token, paystack_plan_code, paystack_authorization_code, last_payment_reference, current_period_end, next_payment_date, created_at, updated_at'

export const freeSubscription = {
  current_period_end: null,
  plan: 'free',
  status: 'free',
}

export const subscriptionService = {
  async getSubscription(userId) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(SUBSCRIPTION_COLUMNS)
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        return { data: null, error }
      }

      return { data: data || freeSubscription, error: null }
    } catch (error) {
      return {
        data: freeSubscription,
        error: {
          message:
            'Unable to reach Supabase. Refresh the page or restart the dev server if you recently changed environment variables.',
          originalError: error,
        },
      }
    }
  },
}
