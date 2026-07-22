import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FormInput } from '../../../components/forms/FormInput'
import { FormSelect } from '../../../components/forms/FormSelect'
import { FormTextarea } from '../../../components/forms/FormTextarea'
import { Button } from '../../../components/ui/Button'
import { calculateInvoiceTotals } from '../../../lib/invoice-calculations'
import { InvoiceItemsFieldArray } from './InvoiceItemsFieldArray'
import { InvoiceSummary } from './InvoiceSummary'

const defaultValues = {
  currency: 'USD',
  customer_id: '',
  discount: 0,
  due_date: '',
  invoice_number: '',
  issue_date: new Date().toISOString().slice(0, 10),
  items: [{ description: '', quantity: 1, unit_price: 0 }],
  notes: '',
  payment_terms: 'due_on_receipt',
  status: 'draft',
  tax_rate: 0,
}

const paymentTerms = [
  { label: 'Due on Receipt', value: 'due_on_receipt', days: 0 },
  { label: 'Net 7', value: 'net_7', days: 7 },
  { label: 'Net 15', value: 'net_15', days: 15 },
  { label: 'Net 30', value: 'net_30', days: 30 },
  { label: 'Net 60', value: 'net_60', days: 60 },
  { label: 'Custom', value: 'custom', days: null },
]

export function InvoiceForm({
  customers,
  defaultInvoiceNumber,
  initialValues,
  isSubmitting,
  onSubmit,
  submitLabel = 'Create invoice',
  submittingLabel = 'Creating invoice...',
}) {
  const navigate = useNavigate()
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm({ defaultValues: initialValues || defaultValues })
  const watchedIssueDate = watch('issue_date')
  const watchedItems = watch('items')
  const watchedPaymentTerms = watch('payment_terms')
  const watchedTaxRate = watch('tax_rate')
  const watchedDiscount = watch('discount')
  const watchedCurrency = watch('currency')
  const totals = calculateInvoiceTotals(watchedItems, watchedTaxRate, watchedDiscount)

  useEffect(() => {
    if (initialValues) {
      reset(initialValues)
    } else if (defaultInvoiceNumber) {
      reset({ ...defaultValues, invoice_number: defaultInvoiceNumber })
    }
  }, [defaultInvoiceNumber, initialValues, reset])

  useEffect(() => {
    const selectedTerm = paymentTerms.find((term) => term.value === watchedPaymentTerms)

    if (!watchedIssueDate || !selectedTerm || selectedTerm.days === null) {
      return
    }

    setValue('due_date', addDaysToDate(watchedIssueDate, selectedTerm.days), {
      shouldDirty: true,
      shouldValidate: true,
    })
  }, [setValue, watchedIssueDate, watchedPaymentTerms])

  return (
    <form className="grid gap-6 xl:grid-cols-[1fr_340px]" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              error={errors.invoice_number}
              id="invoice-number"
              label="Invoice number"
              registration={register('invoice_number', {
                required: 'Invoice number is required.',
              })}
            />
            <FormSelect
              error={errors.customer_id}
              id="customer"
              label="Client"
              registration={register('customer_id', {
                required: 'Choose a client.',
              })}
            >
              <option value="">Select client</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </FormSelect>
            <FormInput
              error={errors.issue_date}
              id="issue-date"
              label="Issue date"
              registration={register('issue_date', {
                required: 'Issue date is required.',
              })}
              type="date"
            />
            <FormSelect
              error={errors.payment_terms}
              id="payment-terms"
              label="Payment terms"
              registration={register('payment_terms', {
                required: 'Payment terms are required.',
              })}
            >
              {paymentTerms.map((term) => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </FormSelect>
            <FormInput
              error={errors.due_date}
              id="due-date"
              label="Due date"
              readOnly={watchedPaymentTerms !== 'custom'}
              registration={register('due_date', {
                required: 'Due date is required.',
              })}
              type="date"
            />
            <FormSelect
              error={errors.status}
              id="status"
              label="Status"
              registration={register('status')}
            >
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </FormSelect>
            <FormSelect
              error={errors.currency}
              id="currency"
              label="Currency"
              registration={register('currency')}
            >
              <option value="USD">USD</option>
              <option value="NGN">NGN</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </FormSelect>
            <FormInput
              error={errors.tax_rate}
              id="tax-rate"
              label="Tax rate (%)"
              min="0"
              registration={register('tax_rate', {
                min: { value: 0, message: 'Tax cannot be negative.' },
                valueAsNumber: true,
              })}
              step="0.01"
              type="number"
            />
            <FormInput
              error={errors.discount}
              id="discount"
              label="Discount"
              min="0"
              registration={register('discount', {
                min: { value: 0, message: 'Discount cannot be negative.' },
                valueAsNumber: true,
              })}
              step="0.01"
              type="number"
            />
          </div>
          <div className="mt-4">
            <FormTextarea
              error={errors.notes}
              id="invoice-notes"
              label="Notes"
              registration={register('notes')}
              rows={3}
            />
          </div>
        </section>

        <InvoiceItemsFieldArray
          control={control}
          errors={errors}
          register={register}
          currency={watchedCurrency}
          watchedItems={watchedItems}
        />
      </div>

      <div className="space-y-4">
        <InvoiceSummary currency={watchedCurrency} totals={totals} />
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className="w-48 px-6 sm:px-6"
            disabled={isSubmitting || customers.length === 0}
            type="submit"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
          <Button
            className="w-48 px-6 sm:px-6"
            onClick={() => navigate('/invoices')}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}

function addDaysToDate(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00`)
  date.setDate(date.getDate() + days)

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}


