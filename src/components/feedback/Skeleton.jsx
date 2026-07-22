import { cn } from '../../utils/cn'

export function Skeleton({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800',
        'bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
