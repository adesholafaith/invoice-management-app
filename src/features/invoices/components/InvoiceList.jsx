import { FiEye } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { formatDate } from '../../../utils/dates'
import { formatCurrency } from '../../../lib/formatters'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'

export function InvoiceList({ invoices }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/60">
            <tr>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Due date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Total</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <TableCell>
                  <Link
                    className="font-semibold text-[var(--ink)] hover:text-[var(--gold)]"
                    to={`/invoices/${invoice.id}`}
                  >
                    {invoice.invoice_number}
                  </Link>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-slate-950 dark:text-white">
                    {invoice.customers?.name || 'Unknown client'}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {invoice.customers?.company || invoice.customers?.email || 'No extra details'}
                  </p>
                </TableCell>
                <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                <TableCell>{formatDate(invoice.due_date)}</TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
                <TableCell align="right">
                  <span className="font-semibold">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      aria-label={`View ${invoice.invoice_number}`}
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#0B0F17] bg-white text-sm font-semibold text-[#0B0F17] transition hover:-translate-y-0.5 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0F17] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                      to={`/invoices/${invoice.id}`}
                    >
                      <FiEye aria-hidden="true" />
                      <span className="sr-only">View</span>
                    </Link>
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 lg:hidden">
        {invoices.map((invoice) => (
          <article className="p-4" key={invoice.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  className="font-semibold text-[var(--ink)] hover:text-[var(--gold)]"
                  to={`/invoices/${invoice.id}`}
                >
                  {invoice.invoice_number}
                </Link>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {invoice.customers?.name || 'Unknown client'}
                </p>
              </div>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <MobileMeta label="Issued" value={formatDate(invoice.issue_date)} />
              <MobileMeta label="Due" value={formatDate(invoice.due_date)} />
              <MobileMeta label="Total" value={formatCurrency(invoice.total, invoice.currency)} />
              <Link
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#0B0F17] bg-white px-4 text-sm font-semibold text-[#0B0F17] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                to={`/invoices/${invoice.id}`}
              >
                <FiEye aria-hidden="true" />
                View
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MobileMeta({ label, value }) {
  return (
    <div>
      <p className="text-slate-500 dark:text-slate-400">{label}</p>
      <p className="font-medium text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function TableCell({ align = 'left', children }) {
  return (
    <td className={`px-5 py-4 align-top text-sm text-slate-600 dark:text-slate-300 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </td>
  )
}

function TableHead({ align = 'left', children }) {
  return (
    <th className={`px-5 py-3 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}


