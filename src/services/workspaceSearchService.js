import { supabase } from '../config/supabaseClients'

export const workspaceSearchService = {
  async search(userId, query) {
    const searchTerm = String(query || '').trim()

    if (!userId || searchTerm.length < 2) {
      return { data: [], error: null }
    }

    const pattern = `%${searchTerm}%`

    const [invoiceResult, customerResult] = await Promise.all([
      supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          status,
          total,
          currency,
          customers!invoices_customer_id_fkey (
            name,
            company
          )
        `)
        .eq('user_id', userId)
        .ilike('invoice_number', pattern)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('customers')
        .select('id, name, company, email')
        .eq('user_id', userId)
        .or(`name.ilike.${pattern},company.ilike.${pattern},email.ilike.${pattern}`)
        .order('created_at', { ascending: false })
        .limit(5),
    ])

    if (invoiceResult.error || customerResult.error) {
      return {
        data: [],
        error: invoiceResult.error || customerResult.error,
      }
    }

    const invoices = (invoiceResult.data || []).map((invoice) => ({
      href: `/invoices/${invoice.id}`,
      id: `invoice-${invoice.id}`,
      label: invoice.invoice_number,
      meta: [
        invoice.customers?.name,
        invoice.status,
        `${invoice.currency || ''} ${Number(invoice.total || 0).toLocaleString()}`.trim(),
      ]
        .filter(Boolean)
        .join(' · '),
      type: 'Invoice',
    }))

    const customers = (customerResult.data || []).map((customer) => ({
      href: `/customers?query=${encodeURIComponent(customer.name || customer.company || '')}`,
      id: `customer-${customer.id}`,
      label: customer.name || customer.company || customer.email,
      meta: [customer.company, customer.email].filter(Boolean).join(' · '),
      type: 'Client',
    }))

    return { data: [...invoices, ...customers], error: null }
  },
}
