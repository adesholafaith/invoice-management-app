import { formatCurrency } from '../../../lib/formatters'
import { formatDate } from '../../../utils/dates'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'

export function InvoiceDetails({ invoice, profile }) {
  const customer = invoice.customers
  const currency = invoice.currency
  const latestPayment = getLatestPayment(invoice)
  const companyLines = [
    profile?.company_name,
    profile?.contact_name,
    profile?.email,
    profile?.phone,
    profile?.address,
    profile?.website,
    profile?.tax_id ? `Tax ID: ${profile.tax_id}` : null,
  ]
  const activity = buildActivity(invoice)

  return (
    <div className="grid gap-6 print:block xl:grid-cols-[1fr_340px]">
      <section className="rounded-lg border border-[var(--paper-line)] bg-white p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--paper-line)] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-[var(--mist)]">Invoice</p>
            <h2 className="mt-1 text-2xl font-semibold">{invoice.invoice_number}</h2>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>

        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Invoice Number" value={invoice.invoice_number} />
          <MetricCard label="Status" value={<InvoiceStatusBadge status={invoice.status} />} />
          <MetricCard label="Amount Due" value={formatCurrency(invoice.total, currency)} />
          <MetricCard label="Payment Terms" value={formatPaymentTerms(invoice.payment_terms)} />
        </div>

        <div className="grid gap-6 pb-6 sm:grid-cols-2">
          <InfoBlock title="From" lines={companyLines} />
          <InfoBlock
            title="Bill to"
            lines={[
              customer?.name,
              customer?.company,
              customer?.email,
              customer?.phone,
              customer?.billing_address,
            ]}
          />
          <InfoBlock
            title="Invoice dates"
            lines={[
              `Issued: ${formatDate(invoice.issue_date)}`,
              `Due: ${formatDate(invoice.due_date)}`,
            ]}
          />
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--paper-line)]">
          <table className="min-w-full divide-y divide-[var(--paper-line)]">
            <thead className="bg-[var(--paper-dim)]">
              <tr>
                <TableHead>Description</TableHead>
                <TableHead align="right">Qty</TableHead>
                <TableHead align="right">Unit price</TableHead>
                <TableHead align="right">Total</TableHead>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--paper-line)]">
              {invoice.invoice_items.map((item) => (
                <tr key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell align="right">{Number(item.quantity)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.unit_price, currency)}</TableCell>
                  <TableCell align="right">{formatCurrency(item.line_total, currency)}</TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoice.notes ? (
          <div className="mt-6 rounded-lg border border-[var(--paper-line)] bg-[var(--paper-dim)] p-4">
            <h3 className="text-sm font-semibold">Notes</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-[var(--text)]">
              {invoice.notes}
            </p>
          </div>
        ) : null}

        {profile?.invoice_footer ? (
          <div className="mt-6 rounded-lg border border-[var(--paper-line)] bg-[var(--paper-dim)] p-4">
            <p className="whitespace-pre-line text-sm text-[var(--text)]">{profile.invoice_footer}</p>
          </div>
        ) : null}
      </section>

      <aside className="space-y-4 print:mt-6 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
          <h3 className="text-base font-semibold">Invoice Snapshot</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow label="Invoice Number" value={invoice.invoice_number} />
            <SummaryRow label="Status" value={<InvoiceStatusBadge status={invoice.status} />} />
            <SummaryRow label="Client" value={customer?.name || 'Unknown client'} />
            <SummaryRow label="Due Date" value={formatDate(invoice.due_date)} />
            <SummaryRow label="Payment Terms" value={formatPaymentTerms(invoice.payment_terms)} />
            <SummaryRow label="Payment Status" value={invoice.status === 'paid' ? 'Paid' : 'Unpaid'} />
          </div>
        </section>

        <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
          <h3 className="text-base font-semibold">Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SummaryRow label="Subtotal" value={formatCurrency(invoice.subtotal, currency)} />
            <SummaryRow label="Tax" value={formatCurrency(invoice.tax_amount, currency)} />
            <SummaryRow label="Discount" value={formatCurrency(-invoice.discount, currency)} />
            <div className="border-t border-[var(--paper-line)] pt-4">
              <p className="text-sm font-medium text-[var(--mist)]">Grand Total</p>
              <p className="mt-2 text-3xl font-bold text-[var(--text)]">
                {formatCurrency(invoice.total, currency)}
              </p>
            </div>
          </div>
        </section>

        {invoice.status === 'paid' ? (
          <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
            <h3 className="text-base font-semibold">Payment</h3>
            <div className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Receipt" value={latestPayment?.receipt_number || 'Pending receipt'} />
              <SummaryRow label="Paid on" value={formatDate(latestPayment?.paid_at || invoice.paid_at || invoice.updated_at)} />
              <SummaryRow label="Method" value={latestPayment?.payment_method || 'Manual payment'} />
              <SummaryRow label="Reference" value={latestPayment?.payment_reference || invoice.payment_reference || 'Pending reference'} />
              <SummaryRow
                label="Amount"
                value={formatCurrency(latestPayment?.amount || invoice.total, latestPayment?.currency || currency)}
              />
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
          <h3 className="text-base font-semibold">Activity</h3>
          <div className="mt-4 space-y-4">
            {activity.map((item) => (
              <div className="flex gap-3" key={item.label}>
                <span className="mt-1 size-2 rounded-full bg-[var(--ink)]" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-[var(--mist)]">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

function buildActivity(invoice) {
  const activities = [...(invoice.invoice_activities || [])].sort(
    (left, right) => new Date(left.created_at) - new Date(right.created_at),
  )

  if (activities.length) {
    return activities.map((activity) => ({
      label: activity.label,
      time: formatDateTime(activity.created_at),
    }))
  }

  return [{ label: 'Invoice created', time: formatDateTime(invoice.created_at) }]
}

function getLatestPayment(invoice) {
  return [...(invoice.payments || [])].sort(
    (left, right) => new Date(right.paid_at) - new Date(left.paid_at),
  )[0]
}

function formatPaymentTerms(value) {
  const labels = {
    custom: 'Custom',
    due_on_receipt: 'Due on Receipt',
    net_7: 'Net 7',
    net_15: 'Net 15',
    net_30: 'Net 30',
    net_60: 'Net 60',
  }

  return labels[value] || 'Custom'
}

function formatDateTime(value) {
  if (!value) return ''

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-lg border border-[var(--paper-line)] bg-[var(--paper-dim)] p-4">
      <p className="text-xs font-semibold uppercase text-[var(--mist)]">{label}</p>
      <div className="mt-2 text-sm font-semibold text-[var(--text)]">{value}</div>
    </article>
  )
}

function InfoBlock({ lines, title }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      <div className="mt-2 space-y-1 text-sm text-[var(--text)]">
        {lines.filter(Boolean).map((line) => (
          <p className="whitespace-pre-line" key={line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

function SummaryRow({ label, value, valueClassName = 'font-semibold' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[var(--mist)]">{label}</span>
      <span className={`${valueClassName} text-right`}>{value}</span>
    </div>
  )
}

function TableCell({ align = 'left', children }) {
  return (
    <td className={`px-4 py-3 text-sm text-[var(--text)] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </td>
  )
}

function TableHead({ align = 'left', children }) {
  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase text-[var(--mist)] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  )
}


