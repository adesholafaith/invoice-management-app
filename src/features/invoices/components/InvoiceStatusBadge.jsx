import { cn } from '../../../utils/cn'

const statusStyles = {
  draft: 'border-transparent bg-[var(--gold-dim)] text-[var(--gold)] dark:bg-yellow-950 dark:text-yellow-200',
  overdue: 'border-transparent bg-[var(--rust-dim)] text-[var(--rust)] dark:bg-rose-950 dark:text-rose-200',
  paid: 'border-transparent bg-[var(--green-dim)] text-[var(--green)] dark:bg-emerald-950 dark:text-emerald-200',
  pending: 'border-transparent bg-[var(--gold-dim)] text-[var(--gold)] dark:bg-yellow-950 dark:text-yellow-200',
}

const dotStyles = {
  draft: 'bg-[var(--mist)]',
  overdue: 'bg-[var(--rust)]',
  paid: 'bg-[var(--green)]',
  pending: 'bg-[var(--gold)]',
}

export function InvoiceStatusBadge({ status }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold capitalize',
        statusStyles[status] || statusStyles.draft,
      )}
    >
      <span className={cn('size-1.5 rounded-full', dotStyles[status] || dotStyles.draft)} />
      {status}
    </span>
  )
}

