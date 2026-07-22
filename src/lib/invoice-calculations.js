export function calculateInvoiceTotals(items = [], taxRate = 0, discount = 0) {
  const subtotal = items.reduce((total, item) => {
    const quantity = Number(item.quantity || 0)
    const unitPrice = Number(item.unit_price ?? item.unitPrice ?? 0)
    return total + quantity * unitPrice
  }, 0)

  const tax = subtotal * (Number(taxRate || 0) / 100)
  const grandTotal = Math.max(subtotal + tax - Number(discount || 0), 0)

  return { subtotal, tax, discount: Number(discount || 0), grandTotal }
}

export function calculateLineTotal(item) {
  return Number(item.quantity || 0) * Number(item.unit_price ?? item.unitPrice ?? 0)
}

export function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100
}
