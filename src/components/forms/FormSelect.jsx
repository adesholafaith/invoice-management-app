import { cn } from '../../utils/cn'

export function FormSelect({ children, error, id, label, registration, ...props }) {
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="min-w-0">
      <label className="text-sm font-semibold text-[var(--text)]" htmlFor={id}>
        {label}
      </label>
      <select
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className={cn(
          'mt-1.5 block min-w-0 max-w-full w-full rounded-md border bg-white px-3.5 py-2.5 pr-9 text-sm text-[var(--text)] shadow-none outline-none transition duration-200 focus:ring-4',
          error
            ? 'border-[var(--rust)] focus:border-[var(--rust)] focus:ring-[rgba(181,72,47,0.15)]'
            : 'border-[var(--paper-line)] hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-[rgba(20,24,31,0.10)]',
        )}
        id={id}
        {...registration}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <p className="mt-1 text-sm text-[var(--rust)]" id={errorId}>
          {error.message}
        </p>
      ) : null}
    </div>
  )
}
