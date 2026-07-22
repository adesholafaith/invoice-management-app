import { formatCurrency } from '../../../lib/formatters'

export function InvoiceSummary({ currency = 'USD', totals }) {
  const rows = [
    { label: 'Subtotal', value: totals.subtotal },
    { label: 'Tax', value: totals.tax },
    { label: 'Discount', value: -totals.discount },
  ]

  return (
    <aside className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
      <h3 className="text-base font-semibold text-[var(--text)]">Invoice summary</h3>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div className="flex items-center justify-between gap-4 text-sm" key={row.label}>
            <span className="text-[var(--mist)]">{row.label}</span>
            <span className="font-medium">{formatCurrency(row.value, currency)}</span>
          </div>
        ))}
        <div className="rounded-lg border border-[var(--paper-line)] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-[var(--text)]">Grand total</span>
            <span className="text-2xl font-bold text-[var(--text)]">
              {formatCurrency(totals.grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}

