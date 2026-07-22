import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiAlertCircle, FiClock, FiFileText, FiRefreshCw, FiTrendingUp } from 'react-icons/fi'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { InvoiceFilters } from '../../features/invoices/components/InvoiceFilters'
import { InvoiceList } from '../../features/invoices/components/InvoiceList'
import { useInvoices } from '../../features/invoices/hooks/useInvoices'

export function InvoiceListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    customers,
    error,
    filteredInvoices,
    filters,
    invoices,
    isLoading,
    refetch,
    resetFilters,
    updateFilter,
  } = useInvoices()

  useEffect(() => {
    const status = searchParams.get('status')
    const query = searchParams.get('query') || ''
    const customerId = searchParams.get('customerId') || ''
    const dateBefore = searchParams.get('dateBefore') || ''

    updateFilter('query', query)
    updateFilter('customerId', customerId)
    updateFilter('dateBefore', dateBefore)
    updateFilter('status', ['draft', 'pending', 'paid', 'overdue'].includes(status) ? status : '')
  }, [searchParams, updateFilter])

  function handleResetFilters() {
    resetFilters()
    setSearchParams({}, { replace: true })
  }

  const summaryCards = [
    { label: 'Total Invoices', value: invoices.length, icon: FiFileText, tone: 'blue' },
    {
      label: 'Paid',
      value: invoices.filter((invoice) => invoice.status === 'paid').length,
      icon: FiTrendingUp,
      tone: 'emerald',
    },
    {
      label: 'Pending',
      value: invoices.filter((invoice) => invoice.status === 'pending').length,
      icon: FiClock,
      tone: 'amber',
    },
    {
      label: 'Overdue',
      value: invoices.filter((invoice) => invoice.status === 'overdue').length,
      icon: FiAlertCircle,
      tone: 'rose',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Invoices</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create, organize and track every invoice in one place.
          </p>
        </div>
        <Button onClick={() => navigate('/invoices/new')}>
          Create invoice
        </Button>
      </div>

      {isLoading ? <InvoiceListSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to load invoices</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <InvoiceSummaryCard {...card} key={card.label} />
          ))}
        </section>
      ) : null}

      {!isLoading && !error && invoices.length === 0 ? (
        <EmptyState
          actionLabel="Create invoice"
          description="Create your first invoice to start tracking revenue, payment status, and client balances."
          icon={<FiFileText aria-hidden="true" className="size-8" />}
          onAction={() => navigate('/invoices/new')}
          title="No invoices yet"
        />
      ) : null}

      {!isLoading && !error && invoices.length > 0 ? (
        <>
          <InvoiceFilters
            customers={customers}
            filters={filters}
            onReset={handleResetFilters}
            onUpdate={updateFilter}
          />

          {filteredInvoices.length > 0 ? (
            <InvoiceList invoices={filteredInvoices} />
          ) : (
            <EmptyState
              description="Try changing your search term, status, client, or date filters."
              icon={<FiFileText aria-hidden="true" className="size-8" />}
              title="No invoices match your filters"
            />
          )}
        </>
      ) : null}
    </div>
  )
}

function InvoiceSummaryCard({ icon: Icon, label, tone, value }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    blue: 'bg-[var(--paper-dim)] text-[var(--ink)]',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9 ${tones[tone]}`}>
          <Icon aria-hidden="true" className="size-4" />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold sm:text-3xl">{value}</p>
    </article>
  )
}

function InvoiceListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20" />
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
      </div>
    </div>
  )
}


