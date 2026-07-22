import { Button } from '../ui/Button'

export function EmptyState({ actionLabel, description, icon, onAction, title }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--paper-line)] bg-white p-8 text-center">
      {icon ? (
        <div className="animate-ledgerly-float mx-auto mb-4 grid size-12 place-items-center rounded-full border border-[var(--paper-line)] bg-[var(--paper-dim)] text-[var(--ink)]">
          {icon}
        </div>
      ) : null}
      <h2 className="text-lg font-semibold text-[var(--text)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[var(--mist)] dark:text-slate-400">
        {description}
      </p>
      {actionLabel ? (
        <Button className="mt-5" onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

