import { cn } from '../../utils/cn'

const variants = {
  primary:
    'btn-premium-gradient hover:-translate-y-0.5 focus-visible:outline-[var(--ink)]',
  secondary:
    'border border-[var(--paper-line)] bg-transparent text-[var(--text)] shadow-none hover:-translate-y-0.5 hover:bg-[var(--paper-dim)] focus-visible:outline-[var(--ink)]',
  danger:
    'border border-[var(--rust-dim)] bg-transparent text-[var(--rust)] shadow-none hover:-translate-y-0.5 hover:bg-[var(--rust-dim)] focus-visible:outline-[var(--rust)]',
}

export function Button({ className, variant = 'primary', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 text-xs font-semibold uppercase tracking-[0.02em] transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:translate-y-0 disabled:scale-100 disabled:opacity-60 disabled:shadow-none sm:px-6',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
