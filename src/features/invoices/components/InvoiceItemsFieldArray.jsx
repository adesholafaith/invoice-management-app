import { FiPlus } from 'react-icons/fi'
import { useFieldArray } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { calculateLineTotal } from '../../../lib/invoice-calculations'
import { formatCurrency } from '../../../lib/formatters'

const emptyItem = {
  description: '',
  quantity: 1,
  unit_price: 0,
}

export function InvoiceItemsFieldArray({ control, currency = 'USD', errors, register, watchedItems }) {
  const { append, fields } = useFieldArray({
    control,
    name: 'items',
  })

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold">Line items</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add every billable product, service, or fee.
          </p>
        </div>
        <Button onClick={() => append(emptyItem)} variant="secondary">
          <FiPlus aria-hidden="true" />
          Add item
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        {fields.map((field, index) => {
          const watchedItem = watchedItems?.[index] || field
          const lineTotal = calculateLineTotal(watchedItem)

          return (
            <div
              className="grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_minmax(110px,0.6fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)]"
              key={field.id}
            >
              <ItemField
                error={errors.items?.[index]?.description}
                id={`item-description-${field.id}`}
                label="Description"
              >
                <input
                  className={itemInputClass(errors.items?.[index]?.description)}
                  id={`item-description-${field.id}`}
                  placeholder="Product/Service"
                  {...register(`items.${index}.description`, {
                    required: 'Description is required.',
                  })}
                />
              </ItemField>
              <ItemField
                error={errors.items?.[index]?.quantity}
                id={`item-quantity-${field.id}`}
                label="Qty"
              >
                <input
                  className={itemInputClass(errors.items?.[index]?.quantity)}
                  id={`item-quantity-${field.id}`}
                  min="0.01"
                  step="0.01"
                  type="number"
                  {...register(`items.${index}.quantity`, {
                    min: { value: 0.01, message: 'Qty must be greater than 0.' },
                    required: 'Qty is required.',
                    valueAsNumber: true,
                  })}
                />
              </ItemField>
              <ItemField
                error={errors.items?.[index]?.unit_price}
                id={`item-unit-price-${field.id}`}
                label="Unit price"
              >
                <input
                  className={itemInputClass(errors.items?.[index]?.unit_price)}
                  id={`item-unit-price-${field.id}`}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register(`items.${index}.unit_price`, {
                    min: { value: 0, message: 'Price cannot be negative.' },
                    required: 'Price is required.',
                    valueAsNumber: true,
                  })}
                />
              </ItemField>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Total</p>
                <p className="mt-1 flex min-h-10 items-center rounded-md bg-slate-50 px-3 text-sm font-semibold dark:bg-slate-950">
                  {formatCurrency(lineTotal, currency)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ItemField({ children, error, id, label }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--text)]" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-[var(--rust)]">{error.message}</p> : null}
    </div>
  )
}

function itemInputClass(error) {
  return [
    'mt-1 min-h-10 w-full rounded-md border bg-white px-3 text-sm text-[var(--text)] outline-none transition focus:ring-4',
    error
      ? 'border-[var(--rust)] focus:border-[var(--rust)] focus:ring-[rgba(181,72,47,0.15)]'
      : 'border-[var(--paper-line)] hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-[rgba(20,24,31,0.10)]',
  ].join(' ')
}

