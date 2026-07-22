import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  FiCopy,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiMail,
  FiMoreVertical,
  FiPrinter,
  FiRefreshCw,
  FiTrash2,
} from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '../../components/feedback/ConfirmDialog'
import { Skeleton } from '../../components/feedback/Skeleton'
import { Button } from '../../components/ui/Button'
import { useSubscription } from '../../features/billing/hooks/useSubscription'
import { InvoiceDetails } from '../../features/invoices/components/InvoiceDetails'
import { InvoiceStatusBadge } from '../../features/invoices/components/InvoiceStatusBadge'
import { useInvoice } from '../../features/invoices/hooks/useInvoice'
import { useAuth } from '../../hooks/useAuth'
import { emailService } from '../../services/emailService'
import { invoiceService } from '../../services/invoiceService'
import { profileService } from '../../services/profileService'

export function InvoiceDetailsPage() {
  const { invoiceId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { error, invoice, isLoading, refetch, setInvoice } = useInvoice(invoiceId)
  const { isLoading: isSubscriptionLoading, isPremium } = useSubscription()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isEmailSending, setIsEmailSending] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [isReceiptGenerating, setIsReceiptGenerating] = useState(false)
  const [isStatusSaving, setIsStatusSaving] = useState(false)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return

      const { data } = await profileService.getProfile(user.id)
      setProfile(data)
    }

    loadProfile()
  }, [user?.id])

  async function handleStatusChange(event) {
    const nextStatus = event.target.value
    setIsStatusSaving(true)

    try {
      const { data, error: statusError } = await invoiceService.updateStatus(invoice.id, user.id, nextStatus)

      if (statusError) {
        throw statusError
      }

      setInvoice(data)
      toast.success('Invoice status updated.')
    } catch (statusError) {
      toast.error(statusError.message || 'Unable to update invoice status.')
    } finally {
      setIsStatusSaving(false)
    }
  }

  async function handleDuplicate() {
    setIsDuplicating(true)

    try {
      const { data, error: duplicateError } = await invoiceService.duplicateInvoice(user.id, invoice)

      if (duplicateError) {
        throw duplicateError
      }

      toast.success('Invoice duplicated.')
      navigate(`/invoices/${data.id}`)
    } catch (duplicateError) {
      toast.error(duplicateError.message || 'Unable to duplicate invoice.')
    } finally {
      setIsDuplicating(false)
    }
  }

  async function handleSendEmail() {
    if (!isPremium) {
      toast.error('Subscribe to send invoice emails.')
      navigate('/billing')
      return
    }

    if (!invoice?.customers?.email) {
      toast.error('Add a client email before sending this invoice.')
      return
    }

    setIsEmailSending(true)

    try {
      const { error: emailError } = await emailService.sendInvoice(invoice.id)

      if (emailError) {
        throw emailError
      }

      toast.success('Invoice email sent.')
      refetch()
    } catch (emailError) {
      toast.error(emailError.message || 'Unable to send invoice email.')
    } finally {
      setIsEmailSending(false)
    }
  }

  async function handleDelete() {
    setIsDeleting(true)

    try {
      const { error: deleteError } = await invoiceService.deleteInvoice(invoice.id)

      if (deleteError) {
        throw deleteError
      }

      toast.success('Invoice deleted.')
      navigate('/invoices')
    } catch (deleteError) {
      toast.error(deleteError.message || 'Unable to delete invoice.')
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleDownloadPdf() {
    if (!isPremium) {
      toast.error('Subscribe to download invoice PDFs.')
      navigate('/billing')
      return
    }

    const { downloadInvoicePdf } = await import('../../lib/pdf')
    downloadInvoicePdf(invoice, profile)
    toast.success('PDF downloaded.')
  }

  async function handleGenerateReceipt() {
    if (!isPremium) {
      toast.error('Subscribe to generate receipt PDFs.')
      navigate('/billing')
      return
    }

    if (invoice.status !== 'paid') {
      toast.error('Mark this invoice as paid before generating a receipt.')
      return
    }

    setIsReceiptGenerating(true)

    try {
      const { data: payment, error: paymentError } = await invoiceService.ensurePaymentRecord(
        invoice.id,
        user.id,
      )

      if (paymentError) {
        throw paymentError
      }

      const { downloadReceiptPdf } = await import('../../lib/pdf')
      downloadReceiptPdf(invoice, payment, profile)
      toast.success('Receipt downloaded.')
      refetch()
    } catch (receiptError) {
      toast.error(receiptError.message || 'Unable to generate receipt.')
    } finally {
      setIsReceiptGenerating(false)
    }
  }

  function handlePrint() {
    if (!isPremium) {
      toast.error('Subscribe to print invoices.')
      navigate('/billing')
      return
    }

    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 print:hidden lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold">
              Invoice {invoice?.invoice_number || ''}
            </h2>
            {invoice ? <InvoiceStatusBadge status={invoice.status} /> : null}
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Review invoice data and manage its lifecycle.
          </p>
        </div>

        {invoice ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end xl:flex-nowrap">
            <label className="sr-only" htmlFor="invoice-status">
              Change invoice status
            </label>
            <select
              className="min-h-10 rounded-md border border-[var(--paper-line)] bg-white px-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)] disabled:opacity-60"
              disabled={isStatusSaving}
              id="invoice-status"
              onChange={handleStatusChange}
              value={invoice.status}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[var(--paper-line)] bg-white px-5 text-xs font-semibold uppercase tracking-[0.02em] text-[var(--text)] transition hover:-translate-y-0.5 hover:bg-[var(--paper-dim)]"
              to={`/invoices/${invoice.id}/edit`}
            >
              <FiEdit2 aria-hidden="true" />
              Edit
            </Link>
            <Button className="whitespace-nowrap" disabled={isSubscriptionLoading} onClick={handleDownloadPdf} variant="secondary">
              <FiDownload aria-hidden="true" />
              Download PDF
            </Button>
            <Button className="whitespace-nowrap" disabled={isSubscriptionLoading || isEmailSending} onClick={handleSendEmail} variant="secondary">
              <FiMail aria-hidden="true" />
              {isEmailSending ? 'Sending...' : 'Email'}
            </Button>
            {invoice.status === 'paid' ? (
              <Button
                disabled={isSubscriptionLoading || isReceiptGenerating}
                className="whitespace-nowrap"
                onClick={handleGenerateReceipt}
                variant="secondary"
              >
                <FiFileText aria-hidden="true" />
                {isReceiptGenerating ? 'Generating...' : 'Receipt'}
              </Button>
            ) : null}
            <div className="relative">
              <Button className="whitespace-nowrap" onClick={() => setIsMoreOpen((current) => !current)} variant="secondary">
                <FiMoreVertical aria-hidden="true" />
                More
              </Button>
              {isMoreOpen ? (
                <div className="absolute right-0 z-10 mt-2 w-44 rounded-lg border border-[var(--paper-line)] bg-white p-1">
                  <MenuButton disabled={isDuplicating} onClick={handleDuplicate}>
                    <FiCopy aria-hidden="true" />
                    {isDuplicating ? 'Duplicating...' : 'Duplicate'}
                  </MenuButton>
                  <MenuButton disabled={isSubscriptionLoading} onClick={handlePrint}>
                    <FiPrinter aria-hidden="true" />
                    Print
                  </MenuButton>
                  <MenuButton
                    className="text-[var(--rust)]"
                    onClick={() => {
                      setIsMoreOpen(false)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <FiTrash2 aria-hidden="true" />
                    Delete
                  </MenuButton>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {isLoading ? <InvoiceDetailsSkeleton /> : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to load invoice</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && invoice ? <InvoiceDetails invoice={invoice} profile={profile} /> : null}

      <ConfirmDialog
        confirmLabel="Delete invoice"
        description={`Delete ${invoice?.invoice_number || 'this invoice'}? This cannot be undone.`}
        isLoading={isDeleting}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete invoice"
      />
    </div>
  )
}

function MenuButton({ children, className = '', disabled, onClick }) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-[var(--text)] hover:bg-[var(--paper-dim)] disabled:opacity-60 ${className}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function InvoiceDetailsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <Skeleton className="h-96" />
      <Skeleton className="h-72" />
    </div>
  )
}


