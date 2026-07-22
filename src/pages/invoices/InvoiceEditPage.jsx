import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiRefreshCw } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { InvoiceForm } from '../../features/invoices/components/InvoiceForm'
import { useInvoice } from '../../features/invoices/hooks/useInvoice'
import { mapInvoiceToFormValues } from '../../features/invoices/utils/invoiceFormValues'
import { useAuth } from '../../hooks/useAuth'
import { customerService } from '../../services/customerService'
import { invoiceService } from '../../services/invoiceService'

export function InvoiceEditPage() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { error: invoiceError, invoice, isLoading: isInvoiceLoading } = useInvoice(invoiceId)
  const [customers, setCustomers] = useState([])
  const [customersError, setCustomersError] = useState(null)
  const [isCustomersLoading, setIsCustomersLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadCustomers = useCallback(async () => {
    if (!user?.id) return

    setIsCustomersLoading(true)
    setCustomersError(null)

    const { data, error } = await customerService.getCustomers(user.id)

    if (error) {
      setCustomersError(error.message)
      toast.error(error.message)
    } else {
      setCustomers(data || [])
    }

    setIsCustomersLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  async function handleUpdateInvoice(values) {
    setIsSubmitting(true)

    try {
      const { data, error } = await invoiceService.updateInvoice(invoice.id, user.id, values)

      if (error) {
        throw error
      }

      toast.success('Invoice updated.')
      navigate(`/invoices/${data.id}`)
    } catch (updateError) {
      toast.error(updateError.message || 'Unable to update invoice.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isInvoiceLoading || isCustomersLoading
  const error = invoiceError || customersError

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Edit invoice</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Update client, dates, status, totals, and line items.
        </p>
      </div>

      {isLoading ? <InvoiceEditSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to prepare edit form</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={loadCustomers} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && invoice ? (
        <InvoiceForm
          customers={customers}
          initialValues={mapInvoiceToFormValues(invoice)}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdateInvoice}
          submitLabel="Save changes"
          submittingLabel="Saving changes..."
        />
      ) : null}
    </div>
  )
}

function InvoiceEditSkeleton() {
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

