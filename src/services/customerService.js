import { supabase } from '../config/supabaseClients'

const CUSTOMER_COLUMNS = `
  id,
  user_id,
  name,
  email,
  phone,
  company,
  billing_address,
  notes,
  created_at,
  updated_at,
  invoices!invoices_customer_id_fkey (
    id,
    currency,
    total
  )
`

const CUSTOMER_MUTATION_COLUMNS =
  'id, user_id, name, email, phone, company, billing_address, notes, created_at, updated_at'

export const customerService = {
  async getCustomers(userId) {
    try {
      const result = await supabase
        .from('customers')
        .select(CUSTOMER_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (result.error) {
        return { ...result, error: toNetworkError(result.error) }
      }

      return {
        ...result,
        data: (result.data || []).map(withCustomerBillingStats),
      }
    } catch (error) {
      return { data: null, error: toNetworkError(error) }
    }
  },

  async createCustomer(userId, values) {
    return supabase
      .from('customers')
      .insert({ ...values, user_id: userId })
      .select(CUSTOMER_MUTATION_COLUMNS)
      .single()
  },

  async updateCustomer(customerId, values) {
    return supabase
      .from('customers')
      .update(values)
      .eq('id', customerId)
      .select(CUSTOMER_MUTATION_COLUMNS)
      .single()
  },

  async deleteCustomer(customerId) {
    return supabase.from('customers').delete().eq('id', customerId)
  },
}

function withCustomerBillingStats(customer) {
  const invoices = customer.invoices || []
  const billedByCurrency = invoices.reduce((totals, invoice) => {
    const currency = invoice.currency || 'USD'
    totals[currency] = (totals[currency] || 0) + Number(invoice.total || 0)
    return totals
  }, {})

  const [primaryCurrency = 'USD'] = Object.keys(billedByCurrency)

  return {
    ...customer,
    billing_currency: primaryCurrency,
    invoice_count: invoices.length,
    total_billed: billedByCurrency[primaryCurrency] || 0,
    total_billed_by_currency: billedByCurrency,
  }
}

function toNetworkError(error) {
  if (error?.message?.includes('Failed to fetch')) {
    return {
      message:
        'Check your internet connection and try again.',
      originalError: error,
    }
  }

  return {
    message: error?.message || 'Please try again.',
    originalError: error,
  }
}
