import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import {
  FiAlertCircle,
  FiArrowUp,
  FiClock,
  FiDownload,
  FiFileText,
  FiPlus,
  FiRefreshCw,
  FiTrendingUp,
  FiUserPlus,
  FiUsers,
} from 'react-icons/fi'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { InvoiceStatusBadge } from '../../features/invoices/components/InvoiceStatusBadge'
import { useSubscription } from '../../features/billing/hooks/useSubscription'
import { useDashboardStats } from '../../features/dashboard/hooks/useDashboardStats'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency } from '../../lib/formatters'
import { formatDate } from '../../utils/dates'

export function DashboardPage() {
  const { user } = useAuth()
  const { error, invoices, isLoading, recentInvoices, refetch, stats } = useDashboardStats()
  const { isPremium, subscription } = useSubscription()
  const firstName = getFirstName(user)
  const hasInvoices = stats.totalCount > 0
  const paidPercent = stats.totalCount ? `${Math.round((stats.paidCount / stats.totalCount) * 100)}%` : '0%'
  const currency = stats.currency || 'NGN'

  const statCards = [
    {
      detail: `${formatCountChange(stats.invoicesCreatedThisWeek)} this week`,
      icon: FiFileText,
      label: 'Total Invoices',
      tone: 'purple',
      to: '/invoices',
      value: stats.totalCount,
    },
    {
      detail: 'Across paid invoices',
      icon: FiTrendingUp,
      label: 'Total Revenue',
      tone: 'emerald',
      to: '/invoices',
      value: formatCurrency(stats.paidRevenue, currency),
    },
    { detail: paidPercent, icon: FiArrowUp, label: 'Paid', tone: 'green', to: '/invoices', value: stats.paidCount },
    {
      detail: 'Awaiting payment',
      icon: FiClock,
      label: 'Pending',
      tone: 'amber',
      to: '/invoices',
      value: stats.pendingCount,
    },
    {
      detail: 'Needs attention',
      icon: FiAlertCircle,
      label: 'Overdue',
      tone: 'red',
      to: '/invoices',
      value: stats.overdueCount,
    },
    {
      detail: `${formatCountChange(stats.customersCreatedThisMonth)} this month`,
      icon: FiUsers,
      label: 'Clients',
      tone: 'blue',
      to: '/customers',
      value: stats.customerCount,
    },
  ]

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mt-2 text-2xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Hello, {firstName}. Here's what's happening with your business today.
        </p>
      </section>

      {isLoading ? <DashboardSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to load dashboard</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          {!hasInvoices ? <DashboardEmptyState /> : null}

          <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {statCards.map((stat) => (
              <DashboardStatCard {...stat} key={stat.label} />
            ))}
          </section>

          <section className="grid gap-4">
            <RecentInvoicesTable currency={currency} invoices={recentInvoices} />
            <RevenueOverview invoices={invoices} stats={stats} />
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.85fr_0.75fr_0.7fr]">
            <QuickActions currency={currency} invoices={invoices} stats={stats} />
            <RecentActivity invoices={invoices} />
            <SubscriptionCard isPremium={isPremium} subscription={subscription} />
          </section>
        </>
      ) : null}

    </div>
  )
}

function getFirstName(user) {
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]

  return displayName?.trim().split(/\s+/)[0] || 'there'
}

function formatCountChange(count = 0) {
  return count > 0 ? `+${count}` : '0'
}

function formatNumberAmount(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

const revenueRanges = [
  { bucketCount: 7, bucketDays: 1, key: '7d', label: '7 Days' },
  { bucketCount: 6, bucketDays: 5, key: '30d', label: '30 Days' },
  { bucketCount: 6, bucketDays: 15, key: '90d', label: '90 Days' },
  { bucketCount: 12, bucketDays: null, key: '12m', label: '12 Months' },
]

function DashboardStatCard({ detail, icon: Icon, label, tone, to = '/invoices', value }) {
  const tones = {
    amber: 'bg-[var(--gold-dim)] text-[var(--gold)]',
    blue: 'bg-[var(--paper-dim)] text-[var(--ink)]',
    emerald: 'bg-[var(--green-dim)] text-[var(--green)]',
    green: 'bg-[var(--green-dim)] text-[var(--green)]',
    purple: 'bg-[var(--paper-dim)] text-[var(--ink)]',
    red: 'bg-[var(--rust-dim)] text-[var(--rust)]',
  }

  return (
    <Link
      className="block rounded-lg border border-[var(--paper-line)] bg-white p-3 transition hover:-translate-y-0.5 hover:border-[var(--ink)] sm:p-4"
      to={to}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--mist)]">{label}</p>
        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9 ${tones[tone]}`}>
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-4 break-words text-xl font-semibold sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-[var(--mist)]">{detail}</p>
    </Link>
  )
}

function RevenueOverview({ invoices, stats }) {
  const [selectedRange, setSelectedRange] = useState('30d')
  const activeRange = revenueRanges.find((range) => range.key === selectedRange) || revenueRanges[1]
  const chartData = buildRevenueChartData(invoices, activeRange)
  const maxValue = Math.max(...chartData.map((bucket) => bucket.total), 1)
  const rangeTotal = chartData.reduce((sum, bucket) => sum + bucket.total, 0)
  const bestBucket = chartData.reduce(
    (best, bucket) => (bucket.total > best.total ? bucket : best),
    { label: 'None', total: 0 },
  )
  const averageRevenue = rangeTotal / chartData.length

  return (
    <section className="min-w-0 rounded-lg border border-[var(--paper-line)] bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-semibold">Revenue Overview</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Paid revenue: {formatCurrency(stats.paidRevenue, stats.currency)}
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 text-xs font-semibold text-slate-500 sm:ml-auto sm:w-auto sm:min-w-80 sm:grid-cols-4">
          {revenueRanges.map((range) => (
            <button
              aria-pressed={selectedRange === range.key}
              className={`shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-center transition ${
                selectedRange === range.key
                  ? 'border-[#0B0F17] bg-[#0B0F17] text-white dark:border-white dark:bg-white dark:text-slate-950'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
              }`}
              key={range.key}
              onClick={() => setSelectedRange(range.key)}
              type="button"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-2 text-xs sm:grid-cols-3">
        <RevenueMetric label="This range" value={formatCurrency(rangeTotal, stats.currency)} />
        <RevenueMetric label="Average" value={formatCurrency(averageRevenue, stats.currency)} />
        <RevenueMetric label="Best" value={bestBucket.label} />
      </div>
      <div className="mt-5 h-60 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-full items-end gap-2">
          {chartData.map((bucket) => {
            const height = bucket.total ? Math.max((bucket.total / maxValue) * 100, 8) : 3

            return (
              <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2" key={bucket.label}>
                <div className="flex min-h-0 flex-1 items-end justify-center">
                  <div
                    className="w-full rounded-t-md bg-[#0B0F17] transition-all duration-300 dark:bg-white"
                    style={{ height: `${height}%` }}
                    title={`${bucket.label}: ${formatCurrency(bucket.total, stats.currency)}`}
                  />
                </div>
                <span className="truncate text-center text-[10px] font-medium text-slate-400">{bucket.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function RevenueMetric({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2 dark:bg-slate-950">
      <p className="text-[10px] font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function buildRevenueChartData(invoices, range) {
  if (range.key === '12m') {
    return buildMonthlyRevenueData(invoices)
  }

  const today = startOfDay(new Date())
  const buckets = Array.from({ length: range.bucketCount }, (_, index) => {
    const end = addDays(today, -range.bucketDays * (range.bucketCount - index - 1))
    const start = addDays(end, -(range.bucketDays - 1))

    return {
      end,
      label: range.bucketDays === 1 ? formatShortDay(end) : `${formatShortDay(start)}-${formatShortDay(end)}`,
      start,
      total: 0,
    }
  })

  getPaidInvoices(invoices).forEach((invoice) => {
    const invoiceDate = startOfDay(getInvoiceRevenueDate(invoice))
    const bucket = buckets.find((item) => invoiceDate >= item.start && invoiceDate <= item.end)

    if (bucket) {
      bucket.total += Number(invoice.total || 0)
    }
  })

  return buckets
}

function buildMonthlyRevenueData(invoices) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const buckets = Array.from({ length: 12 }, (_, index) => {
    const monthDate = new Date(currentYear, index, 1)

    return {
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      month: monthDate.getMonth(),
      total: 0,
      year: currentYear,
    }
  })

  getPaidInvoices(invoices).forEach((invoice) => {
    const invoiceDate = getInvoiceRevenueDate(invoice)
    const bucket = buckets.find(
      (item) => item.month === invoiceDate.getMonth() && item.year === invoiceDate.getFullYear(),
    )

    if (bucket) {
      bucket.total += Number(invoice.total || 0)
    }
  })

  return buckets
}

function getPaidInvoices(invoices) {
  return invoices.filter((invoice) => invoice.status === 'paid')
}

function getInvoiceRevenueDate(invoice) {
  return new Date(invoice.paid_at || invoice.payment_date || invoice.updated_at || invoice.created_at || invoice.issue_date)
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function formatShortDay(date) {
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function RecentInvoicesTable({ currency, invoices }) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Recent Invoices</h3>
        <Link className="text-sm font-semibold text-[var(--ink)] hover:text-[var(--gold)]" to="/invoices">
          View all
        </Link>
      </div>
      {invoices.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-[var(--paper-line)] p-6 text-center text-sm text-[var(--mist)]">
          Recent invoices will appear here after you create one.
        </p>
      ) : (
        <>
        <div className="mt-4 space-y-3 md:hidden">
          {invoices.map((invoice) => (
            <Link
              className="block rounded-lg border border-[var(--paper-line)] p-4 transition hover:border-[var(--ink)] hover:bg-[var(--paper-dim)]"
              key={invoice.id}
              to={`/invoices/${invoice.id}`}
            >
              <MobileInvoiceRow label="Invoice" value={invoice.invoice_number} />
              <MobileInvoiceRow
                label="Client"
                value={invoice.customers?.name || 'Unknown client'}
              />
              <MobileInvoiceRow
                label={`Amount (${invoice.currency || currency})`}
                value={formatNumberAmount(invoice.total)}
              />
              <MobileInvoiceRow
                label="Status"
                value={<InvoiceStatusBadge status={invoice.status} />}
              />
              <MobileInvoiceRow label="Due date" value={formatDate(invoice.due_date)} />
            </Link>
          ))}
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full table-fixed text-left text-xs lg:text-[13px]">
            <colgroup>
              <col className="w-[10%]" />
              <col className="w-[14%]" />
              <col className="w-[14%]" />
              <col className="w-[10%]" />
              <col className="w-[11%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="text-[13px] uppercase text-[var(--mist)]">
              <tr>
                <th className="whitespace-nowrap py-3 pr-2 font-semibold">Invoice</th>
                <th className="whitespace-nowrap py-3 pr-2 font-semibold">Client</th>
                <th className="whitespace-nowrap py-3 pr-4 font-semibold">Amount ({currency})</th>
                <th className="whitespace-nowrap py-3 pr-2 font-semibold">Status</th>
                <th className="whitespace-nowrap py-3 pr-1 font-semibold">Due Date</th>
                <th className="whitespace-nowrap py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--paper-line)]">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="whitespace-nowrap py-3 pr-2 font-semibold">{invoice.invoice_number}</td>
                  <td className="truncate whitespace-nowrap py-3 pr-2 text-[var(--mist)]">
                    {invoice.customers?.name || 'Unknown client'}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-4 font-mono font-medium tabular-nums">
                    {formatNumberAmount(invoice.total)}
                  </td>
                  <td className="whitespace-nowrap py-3 pr-2">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>
                  <td className="whitespace-nowrap py-3 pr-1 text-[var(--mist)]">
                    {formatDate(invoice.due_date)}
                  </td>
                  <td className="whitespace-nowrap py-3">
                    <Link className="font-semibold text-[var(--ink)] hover:text-[var(--gold)]" to={`/invoices/${invoice.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </section>
  )
}

function MobileInvoiceRow({ label, value }) {
  return (
    <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 py-2 text-sm">
      <span className="font-medium capitalize text-slate-500 dark:text-slate-400">{label}</span>
      <span className="min-w-0 text-right font-semibold text-slate-950 dark:text-white">{value}</span>
    </div>
  )
}

function QuickActions({ currency, invoices, stats }) {
  const linkActions = [
    { icon: FiPlus, label: 'Create Invoice', to: '/invoices/new' },
    { icon: FiUserPlus, label: 'Add Client', to: '/customers' },
  ]
  const reportActions = [
    {
      icon: FiFileText,
      label: 'Export Report',
      onClick: () => exportInvoicesReport(invoices),
    },
    {
      icon: FiDownload,
      label: 'Download Revenue Report',
      onClick: () => exportRevenueReport(stats, currency),
    },
  ]

  return (
    <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
      <h3 className="font-semibold">Quick Actions</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {linkActions.map((action) => {
          const Icon = action.icon

          return (
            <Link
              className="flex min-h-12 items-center gap-3 rounded-md border border-[#0B0F17] bg-white px-4 text-sm font-semibold text-[#0B0F17] transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              key={action.label}
              to={action.to}
            >
              <Icon aria-hidden="true" className="size-4" />
              {action.label}
            </Link>
          )
        })}
        {reportActions.map((action) => {
          const Icon = action.icon

          return (
            <button
              className="flex min-h-12 items-center gap-3 rounded-md border border-[#0B0F17] bg-white px-4 text-left text-sm font-semibold text-[#0B0F17] transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              key={action.label}
              onClick={action.onClick}
              type="button"
            >
              <Icon aria-hidden="true" className="size-4" />
              {action.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function RecentActivity({ invoices }) {
  const activities = invoices
    .flatMap((invoice) => {
      const invoiceActivities = invoice.invoice_activities || []

      if (invoiceActivities.length > 0) {
        return invoiceActivities.map((activity) => ({
          label: `${activity.label} for ${invoice.invoice_number}.`,
          time: formatRelativeTime(activity.created_at),
          timeValue: activity.created_at,
        }))
      }

      return [
        {
          label:
            invoice.status === 'paid'
              ? `Invoice ${invoice.invoice_number} paid.`
              : `Invoice ${invoice.invoice_number} updated.`,
          time: formatRelativeTime(invoice.updated_at || invoice.created_at),
          timeValue: invoice.updated_at || invoice.created_at,
        },
      ]
    })
    .slice()
    .sort((a, b) => new Date(b.timeValue || 0) - new Date(a.timeValue || 0))
    .slice(0, 3)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">Recent Activity</h3>
      <div className="mt-4 space-y-4">
        {(activities.length ? activities : [{ label: 'No recent activity yet.', time: 'Create your first invoice' }]).map(
          (activity) => (
            <div className="flex gap-3" key={`${activity.label}-${activity.time}`}>
              <span className="mt-1 size-2 rounded-full bg-[var(--ink)]" />
              <div>
                <p className="text-sm font-medium">{activity.label}</p>
                <p className="mt-1 text-xs text-[var(--mist)]">{activity.time}</p>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

function exportInvoicesReport(invoices) {
  if (invoices.length === 0) {
    toast.error('Create an invoice before exporting a report.')
    return
  }

  downloadCsv('billing-invoices.csv', [
    ['Invoice ID', 'Client', 'Issue Date', 'Due Date', 'Status', 'Currency', 'Total'],
    ...invoices.map((invoice) => [
      invoice.invoice_number,
      invoice.customers?.name || 'Unknown client',
      invoice.issue_date,
      invoice.due_date,
      invoice.status,
      invoice.currency,
      Number(invoice.total || 0).toFixed(2),
    ]),
  ])
  toast.success('Invoice report downloaded.')
}

function exportRevenueReport(stats, currency) {
  if (stats.totalCount === 0) {
    toast.error('Create an invoice before downloading a revenue report.')
    return
  }

  downloadCsv('billing-revenue-report.csv', [
    ['Metric', 'Currency', 'Value'],
    ['Paid Revenue', currency, Number(stats.paidRevenue || 0).toFixed(2)],
    ['Outstanding Revenue', currency, Number(stats.outstandingRevenue || 0).toFixed(2)],
    ['Overdue Revenue', currency, Number(stats.overdueRevenue || 0).toFixed(2)],
    ['Total Invoices', '', stats.totalCount],
    ['Paid Invoices', '', stats.paidCount],
    ['Pending Invoices', '', stats.pendingCount],
    ['Overdue Invoices', '', stats.overdueCount],
    ['Draft Invoices', '', stats.draftCount],
  ])
  toast.success('Revenue report downloaded.')
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function escapeCsvValue(value) {
  const text = String(value ?? '')

  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`
  }

  return text
}

function formatRelativeTime(value) {
  if (!value) return 'Recently'

  const date = new Date(value)
  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000)
  const ranges = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  for (const [unit, seconds] of ranges) {
    if (Math.abs(diffSeconds) >= seconds) {
      return formatter.format(Math.round(diffSeconds / seconds), unit)
    }
  }

  return 'Just now'
}

function SubscriptionCard({ isPremium, subscription }) {
  return (
    <section className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
      <h3 className="font-semibold">Subscription</h3>
      <div className="mt-4 rounded-lg bg-[var(--paper-dim)] p-4">
        <p className="mt-2 text-lg font-semibold">
          {isPremium
            ? `Renews ${subscription.current_period_end ? formatDate(subscription.current_period_end) : 'soon'}`
            : 'Current Plan:'}
        </p>
        <p className="text-sm text-[var(--mist)]">
          {isPremium ? 'Pro Plan' : 'Free Plan'}
        </p> 
      </div>
      <Link
        className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full border border-[#0B0F17] bg-white px-4 text-xs font-semibold uppercase tracking-[0.02em] text-[#0B0F17] transition duration-300 hover:-translate-y-0.5 hover:bg-slate-50 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0F17]"
        to="/billing"
      >
        {isPremium ? 'Manage subscription' : 'Upgrade to Pro'}
      </Link>
    </section>
  )
}

function DashboardEmptyState() {
  return (
    <section className="rounded-lg border border-dashed border-[#0B0F17] bg-white p-6 text-center">
      <h3 className="text-xl font-semibold">Welcome to Your Dashboard</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text)]">
        You haven't created any invoices yet. Start by creating your first invoice and inviting your clients.
      </p>
      <Link
        className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[#0B0F17] bg-white px-5 text-xs font-semibold uppercase tracking-[0.02em] text-[#0B0F17] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--paper-dim)] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B0F17] sm:px-6"
        to="/invoices/new"
      >
        Create First Invoice
      </Link>
    </section>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton className="h-32" key={index} />
        ))}
      </section>
      <section className="grid gap-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </section>
      <section className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </section>
    </div>
  )
}


