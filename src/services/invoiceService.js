import { supabase } from '../config/supabaseClients'
import {
  calculateInvoiceTotals,
  calculateLineTotal,
  roundMoney,
} from '../lib/invoice-calculations'

const INVOICE_COLUMNS = `
  id,
  user_id,
  customer_id,
  invoice_number,
  status,
  issue_date,
  due_date,
  payment_terms,
  payment_reference,
  paid_at,
  currency,
  tax_rate,
  discount,
  subtotal,
  tax_amount,
  total,
  notes,
  created_at,
  updated_at,
  customers!invoices_customer_id_fkey (
    id,
    name,
    email,
    phone,
    company,
    billing_address
  ),
  invoice_items!invoice_items_invoice_id_fkey (
    id,
    description,
    quantity,
    unit_price,
    line_total,
    position
  ),
  invoice_activities!invoice_activities_invoice_id_fkey (
    id,
    type,
    label,
    created_at
  ),
  payments!payments_invoice_id_fkey (
    id,
    receipt_number,
    payment_method,
    payment_reference,
    amount,
    currency,
    description,
    paid_at,
    created_at
  )
`

const paidStatuses = new Set(['paid'])

export const invoiceService = {
  async getInvoice(invoiceId) {
    return supabase.from('invoices').select(INVOICE_COLUMNS).eq('id', invoiceId).single()
  },

  async getInvoices(userId) {
    try {
      const result = await supabase
        .from('invoices')
        .select(INVOICE_COLUMNS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .order('position', { referencedTable: 'invoice_items', ascending: true })

      if (result.error) {
        return { ...result, error: toNetworkError(result.error) }
      }

      return result
    } catch (error) {
      return { data: null, error: toNetworkError(error) }
    }
  },

  async createInvoice(userId, values) {
    const items = values.items.map((item, index) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      line_total: roundMoney(calculateLineTotal(item)),
      position: index,
      user_id: userId,
    }))
    const totals = calculateInvoiceTotals(items, values.tax_rate, values.discount)
    const isPaidOnCreate = paidStatuses.has(values.status)
    const paymentReference = isPaidOnCreate ? generatePaymentReference() : null
    const paidAt = isPaidOnCreate ? new Date().toISOString() : null

    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: userId,
        customer_id: values.customer_id,
        invoice_number: values.invoice_number,
        status: values.status,
        issue_date: values.issue_date,
        due_date: values.due_date,
        payment_terms: values.payment_terms,
        payment_reference: paymentReference,
        paid_at: paidAt,
        currency: values.currency,
        tax_rate: Number(values.tax_rate || 0),
        discount: roundMoney(values.discount),
        subtotal: roundMoney(totals.subtotal),
        tax_amount: roundMoney(totals.tax),
        total: roundMoney(totals.grandTotal),
        notes: values.notes || null,
      })
      .select('id')
      .single()

    if (invoiceError) {
      return { data: null, error: invoiceError }
    }

    const { error: itemsError } = await supabase.from('invoice_items').insert(
      items.map((item) => ({
        ...item,
        invoice_id: invoice.id,
      })),
    )

    if (itemsError) {
      await supabase.from('invoices').delete().eq('id', invoice.id)
      return { data: null, error: itemsError }
    }

    const activities = [{ type: 'created', label: 'Invoice created' }]

    if (isPaidOnCreate) {
      const { error: paymentError } = await createPaymentRecord({
        amount: roundMoney(totals.grandTotal),
        currency: values.currency,
        invoiceId: invoice.id,
        invoiceNumber: values.invoice_number,
        paidAt,
        paymentReference,
        userId,
      })

      if (paymentError) {
        return { data: null, error: paymentError }
      }

      activities.push({ type: 'payment_received', label: 'Payment received' })
    }

    const { error: activityError } = await insertActivities(invoice.id, userId, activities)

    if (activityError) {
      return { data: null, error: activityError }
    }

    return supabase.from('invoices').select(INVOICE_COLUMNS).eq('id', invoice.id).single()
  },

  async updateInvoice(invoiceId, userId, values) {
    const items = values.items.map((item, index) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
      line_total: roundMoney(calculateLineTotal(item)),
      position: index,
      user_id: userId,
      invoice_id: invoiceId,
    }))
    const totals = calculateInvoiceTotals(items, values.tax_rate, values.discount)
    const { data: currentInvoice, error: currentInvoiceError } = await supabase
      .from('invoices')
      .select('status, invoice_number, payment_reference, paid_at')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single()

    if (currentInvoiceError) {
      return { data: null, error: currentInvoiceError }
    }

    const isNowPaid = paidStatuses.has(values.status)
    const becamePaid = isNowPaid && currentInvoice.status !== 'paid'
    const nextPaymentReference = isNowPaid
      ? currentInvoice.payment_reference || generatePaymentReference()
      : currentInvoice.payment_reference
    const nextPaidAt = isNowPaid ? currentInvoice.paid_at || new Date().toISOString() : currentInvoice.paid_at

    const { error: invoiceError } = await supabase
      .from('invoices')
      .update({
        customer_id: values.customer_id,
        invoice_number: values.invoice_number,
        status: values.status,
        issue_date: values.issue_date,
        due_date: values.due_date,
        payment_terms: values.payment_terms,
        payment_reference: nextPaymentReference,
        paid_at: nextPaidAt,
        currency: values.currency,
        tax_rate: Number(values.tax_rate || 0),
        discount: roundMoney(values.discount),
        subtotal: roundMoney(totals.subtotal),
        tax_amount: roundMoney(totals.tax),
        total: roundMoney(totals.grandTotal),
        notes: values.notes || null,
      })
      .eq('id', invoiceId)

    if (invoiceError) {
      return { data: null, error: invoiceError }
    }

    const { error: deleteError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId)

    if (deleteError) {
      return { data: null, error: deleteError }
    }

    const { error: itemsError } = await supabase.from('invoice_items').insert(items)

    if (itemsError) {
      return { data: null, error: itemsError }
    }

    if (becamePaid) {
      const { error: paymentError } = await createPaymentRecord({
        amount: roundMoney(totals.grandTotal),
        currency: values.currency,
        invoiceId,
        invoiceNumber: values.invoice_number,
        paidAt: nextPaidAt,
        paymentReference: nextPaymentReference,
        userId,
      })

      if (paymentError) {
        return { data: null, error: paymentError }
      }

      const { error: activityError } = await insertActivities(invoiceId, userId, [
        { type: 'payment_received', label: 'Payment received' },
      ])

      if (activityError) {
        return { data: null, error: activityError }
      }
    }

    return supabase.from('invoices').select(INVOICE_COLUMNS).eq('id', invoiceId).single()
  },

  async updateStatus(invoiceId, userId, status) {
    const { data: currentInvoice, error: currentInvoiceError } = await supabase
      .from('invoices')
      .select('status, invoice_number, payment_reference, paid_at, total, currency')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single()

    if (currentInvoiceError) {
      return { data: null, error: currentInvoiceError }
    }

    const isNowPaid = paidStatuses.has(status)
    const becamePaid = isNowPaid && currentInvoice.status !== 'paid'
    const updateValues = {
      status,
      payment_reference: isNowPaid
        ? currentInvoice.payment_reference || generatePaymentReference()
        : currentInvoice.payment_reference,
      paid_at: isNowPaid ? currentInvoice.paid_at || new Date().toISOString() : currentInvoice.paid_at,
    }

    const result = await supabase
      .from('invoices')
      .update(updateValues)
      .eq('id', invoiceId)
      .select(INVOICE_COLUMNS)
      .single()

    if (result.error) {
      return result
    }

    if (becamePaid) {
      const { error: paymentError } = await createPaymentRecord({
        amount: Number(currentInvoice.total || 0),
        currency: currentInvoice.currency,
        invoiceId,
        invoiceNumber: currentInvoice.invoice_number,
        paidAt: updateValues.paid_at,
        paymentReference: updateValues.payment_reference,
        userId,
      })

      if (paymentError) {
        return { data: null, error: paymentError }
      }

      const { error: activityError } = await insertActivities(invoiceId, userId, [
        { type: 'payment_received', label: 'Payment received' },
      ])

      if (activityError) {
        return { data: null, error: activityError }
      }

      return supabase.from('invoices').select(INVOICE_COLUMNS).eq('id', invoiceId).single()
    }

    return result
  },

  async deleteInvoice(invoiceId) {
    return supabase.from('invoices').delete().eq('id', invoiceId)
  },

  async duplicateInvoice(userId, invoice) {
    const { data: invoiceNumber, error: numberError } = await this.generateInvoiceNumber(userId)

    if (numberError) {
      return { data: null, error: numberError }
    }

    return this.createInvoice(userId, {
      currency: invoice.currency,
      customer_id: invoice.customer_id,
      discount: Number(invoice.discount || 0),
      invoice_number: invoiceNumber,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: invoice.due_date,
      payment_terms: invoice.payment_terms || 'custom',
      items: invoice.invoice_items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity || 0),
        unit_price: Number(item.unit_price || 0),
      })),
      notes: invoice.notes,
      status: 'draft',
      tax_rate: Number(invoice.tax_rate || 0),
    })
  },

  async generateInvoiceNumber(userId) {
    const { count, error } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) {
      return { data: null, error }
    }

    const nextNumber = String((count || 0) + 1).padStart(4, '0')
    return { data: `INV-${nextNumber}`, error: null }
  },

  async ensurePaymentRecord(invoiceId, userId) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id, user_id, invoice_number, status, payment_reference, paid_at, total, currency')
      .eq('id', invoiceId)
      .eq('user_id', userId)
      .single()

    if (invoiceError) {
      return { data: null, error: invoiceError }
    }

    if (invoice.status !== 'paid') {
      return { data: null, error: { message: 'Mark this invoice as paid before generating a receipt.' } }
    }

    const { data: existingPayment, error: existingPaymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .eq('user_id', userId)
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingPaymentError) {
      return { data: null, error: existingPaymentError }
    }

    if (existingPayment) {
      return { data: existingPayment, error: null }
    }

    const paymentReference = invoice.payment_reference || generatePaymentReference()
    const paidAt = invoice.paid_at || new Date().toISOString()
    const { data: payment, error: paymentError } = await createPaymentRecord({
      amount: Number(invoice.total || 0),
      currency: invoice.currency,
      invoiceId,
      invoiceNumber: invoice.invoice_number,
      paidAt,
      paymentReference,
      userId,
    })

    return { data: payment, error: paymentError }
  },
}

function generatePaymentReference() {
  const date = new Date()
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `TRX-${stamp}-${random}`
}

async function insertActivities(invoiceId, userId, activities) {
  if (!activities.length) {
    return { error: null }
  }

  return supabase.from('invoice_activities').insert(
    activities.map((activity) => ({
      invoice_id: invoiceId,
      user_id: userId,
      type: activity.type,
      label: activity.label,
    })),
  )
}

async function createPaymentRecord({
  amount,
  currency,
  invoiceId,
  invoiceNumber,
  paidAt,
  paymentReference,
  userId,
}) {
  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle()

  if (existingPaymentError) {
    return { data: null, error: existingPaymentError }
  }

  if (existingPayment) {
    return { data: existingPayment, error: null }
  }

  return supabase
    .from('payments')
    .insert({
      amount,
      currency,
      description: `Payment for invoice ${invoiceNumber}`,
      invoice_id: invoiceId,
      paid_at: paidAt,
      payment_method: 'Manual payment',
      payment_reference: paymentReference,
      receipt_number: generateReceiptNumber(),
      user_id: userId,
    })
    .select('*')
    .single()
}

function generateReceiptNumber() {
  const date = new Date()
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()

  return `RCT-${stamp}-${random}`
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
