import { cn } from '../../utils/cn'

export function IconButton({ className, icon, type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-grid size-10 place-items-center rounded-full border border-[var(--paper-line)] bg-white text-[var(--ink)] shadow-none transition duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-[var(--paper-dim)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)] disabled:translate-y-0 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  )
}
