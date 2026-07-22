export function mapInvoiceToFormValues(invoice) {
  return {
    currency: invoice.currency,
    customer_id: invoice.customer_id,
    discount: Number(invoice.discount || 0),
    due_date: invoice.due_date,
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date,
    payment_terms: invoice.payment_terms || 'custom',
    items: invoice.invoice_items.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity || 0),
      unit_price: Number(item.unit_price || 0),
    })),
    notes: invoice.notes || '',
    status: invoice.status,
    tax_rate: Number(invoice.tax_rate || 0),
  }
}
