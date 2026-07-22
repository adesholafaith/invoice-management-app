import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiUsers } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/feedback/EmptyState'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { InvoiceForm } from '../../features/invoices/components/InvoiceForm'
import { useInvoiceSetup } from '../../features/invoices/hooks/useInvoiceSetup'
import { useAuth } from '../../hooks/useAuth'
import { invoiceService } from '../../services/invoiceService'

export function InvoiceCreatePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { customers, error, invoiceNumber, isLoading, refetch } = useInvoiceSetup()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateInvoice(values) {
    setIsSubmitting(true)

    try {
      const { data, error: createError } = await invoiceService.createInvoice(user.id, values)

      if (createError) {
        throw createError
      }

      toast.success('Invoice created.')
      navigate(`/invoices/${data.id}`)
    } catch (createError) {
      toast.error(createError.message || 'Unable to create invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Create invoice</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Build a professional invoice with client details, line items, tax, and discounts.
        </p>
      </div>

      {isLoading ? <InvoiceFormSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to prepare invoice form</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && customers.length === 0 ? (
        <EmptyState
          actionLabel="Add client"
          description="Create at least one client before writing an invoice."
          icon={<FiUsers aria-hidden="true" className="size-8" />}
          onAction={() => navigate('/customers')}
          title="You need a client first"
        />
      ) : null}

      {!isLoading && !error && customers.length > 0 ? (
        <InvoiceForm
          customers={customers}
          defaultInvoiceNumber={invoiceNumber}
          isSubmitting={isSubmitting}
          onSubmit={handleCreateInvoice}
        />
      ) : null}
    </div>
  )
}

function InvoiceFormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Skeleton className="h-80" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

