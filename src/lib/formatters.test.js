import { describe, expect, it } from 'vitest'
import { formatCurrency } from './formatters'

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1500)).toBe('$1,500.00')
  })

  it('formats NGN when currency is provided', () => {
    expect(formatCurrency(1500, 'NGN')).toContain('1,500.00')
  })
})
