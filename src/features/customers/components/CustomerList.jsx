import { FiEdit2, FiMail, FiPhone, FiTrash2 } from 'react-icons/fi'
import { IconButton } from '../../../components/ui/IconButton'
import { formatCurrency } from '../../../lib/formatters'

export function CustomerList({ customers, onDelete, onEdit }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950/60">
            <tr>
              <TableHead>Client</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Billing Address</TableHead>
              <TableHead align="right">Invoices</TableHead>
              <TableHead align="right">Total Billed</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <TableCell>
                  <p className="font-medium text-slate-950 dark:text-white">{customer.name}</p>
                </TableCell>
                <TableCell>
                  <MutedText value={customer.company || 'No company'} />
                </TableCell>
                <TableCell>
                  <ContactLine icon={<FiMail aria-hidden="true" />} value={customer.email} />
                  <ContactLine icon={<FiPhone aria-hidden="true" />} value={customer.phone} />
                </TableCell>
                <TableCell>
                  <p className="line-clamp-2 max-w-xs text-sm text-slate-600 dark:text-slate-300">
                    {customer.billing_address || 'No billing address'}
                  </p>
                </TableCell>
                <TableCell align="right">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {customer.invoice_count || 0}
                  </p>
                </TableCell>
                <TableCell align="right">
                  <TotalBilled customer={customer} />
                </TableCell>
                <TableCell align="right">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      aria-label={`Edit ${customer.name}`}
                      icon={<FiEdit2 aria-hidden="true" />}
                      onClick={() => onEdit(customer)}
                    />
                    <IconButton
                      aria-label={`Delete ${customer.name}`}
                      icon={<FiTrash2 aria-hidden="true" />}
                      onClick={() => onDelete(customer)}
                    />
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
        {customers.map((customer) => (
          <article className="p-4" key={customer.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-medium text-slate-950 dark:text-white">
                  {customer.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {customer.company || 'No company'}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <IconButton
                  aria-label={`Edit ${customer.name}`}
                  icon={<FiEdit2 aria-hidden="true" />}
                  onClick={() => onEdit(customer)}
                />
                <IconButton
                  aria-label={`Delete ${customer.name}`}
                  icon={<FiTrash2 aria-hidden="true" />}
                  onClick={() => onDelete(customer)}
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <ContactLine icon={<FiMail aria-hidden="true" />} value={customer.email} />
              <ContactLine icon={<FiPhone aria-hidden="true" />} value={customer.phone} />
              <MobileMeta label="Billing Address" value={customer.billing_address || 'No billing address'} />
              <MobileMeta label="Invoices" value={customer.invoice_count || 0} />
              <MobileMeta label="Total Billed" value={<TotalBilled customer={customer} />} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ContactLine({ icon, value }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{value || 'Not provided'}</span>
    </p>
  )
}

function MobileMeta({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-slate-700 dark:text-slate-200">
        {value}
      </span>
    </div>
  )
}

function MutedText({ value }) {
  return <p className="text-sm text-slate-600 dark:text-slate-300">{value}</p>
}

function TotalBilled({ customer }) {
  const totals = Object.entries(customer.total_billed_by_currency || {})

  if (totals.length === 0) {
    return (
      <p className="text-sm font-semibold text-slate-950 dark:text-white">
        {formatCurrency(0, customer.billing_currency || 'USD')}
      </p>
    )
  }

  return (
    <div className="space-y-1">
      {totals.map(([currency, total]) => (
        <p className="text-sm font-semibold text-slate-950 dark:text-white" key={currency}>
          {formatCurrency(total, currency)}
        </p>
      ))}
    </div>
  )
}

function TableCell({ align = 'left', children }) {
  return (
    <td className={`px-5 py-4 align-top ${align === 'right' ? 'text-right' : 'text-left'}`}>
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


