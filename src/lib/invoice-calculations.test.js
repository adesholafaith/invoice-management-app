import { describe, expect, it } from 'vitest'
import { calculateInvoiceTotals, calculateLineTotal, roundMoney } from './invoice-calculations'

describe('invoice calculations', () => {
  it('calculates line totals from quantity and unit price', () => {
    expect(calculateLineTotal({ quantity: 3, unit_price: 1250 })).toBe(3750)
  })

  it('calculates subtotal, tax, discount, and grand total', () => {
    const totals = calculateInvoiceTotals(
      [
        { quantity: 2, unit_price: 1500 },
        { quantity: 1, unit_price: 1000 },
      ],
      7.5,
      500,
    )

    expect(totals).toEqual({
      discount: 500,
      grandTotal: 3800,
      subtotal: 4000,
      tax: 300,
    })
  })

  it('does not return a negative grand total', () => {
    expect(calculateInvoiceTotals([{ quantity: 1, unit_price: 100 }], 0, 500).grandTotal).toBe(0)
  })

  it('rounds money to two decimals', () => {
    expect(roundMoney(10.235)).toBe(10.24)
  })
})
