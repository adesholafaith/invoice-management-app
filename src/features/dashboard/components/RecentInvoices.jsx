import { Link } from 'react-router-dom'
import { formatCurrency } from '../../../lib/formatters'
import { formatDate } from '../../../utils/dates'
import { InvoiceStatusBadge } from '../../invoices/components/InvoiceStatusBadge'

export function RecentInvoices({ invoices }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Recent invoices</h3>
        <Link className="text-sm font-semibold text-blue-700 dark:text-blue-300" to="/invoices">
          View all
        </Link>
      </div>

      {invoices.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Recent invoices will appear here after you create one.
        </p>
      ) : (
        <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
          {invoices.map((invoice) => (
            <Link
              className="flex flex-col gap-3 py-4 transition hover:bg-slate-50 dark:hover:bg-slate-950/60 sm:flex-row sm:items-center sm:justify-between"
              key={invoice.id}
              to={`/invoices/${invoice.id}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-slate-950 dark:text-white">
                  {invoice.invoice_number}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {invoice.customers?.name || 'Unknown client'} · Due {formatDate(invoice.due_date)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <InvoiceStatusBadge status={invoice.status} />
                <p className="min-w-24 text-right font-semibold">
                  {formatCurrency(invoice.total, invoice.currency)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}


