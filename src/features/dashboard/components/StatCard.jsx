export function StatCard({ icon: Icon, label, tone = 'blue', value }) {
  const tones = {
    amber: 'bg-[var(--gold-dim)] text-[var(--gold)] ring-[var(--gold-dim)] dark:text-amber-300',
    blue: 'bg-[var(--paper-dim)] text-[var(--ink)] ring-[var(--paper-line)]',
    emerald: 'bg-[var(--green-dim)] text-[var(--green)] ring-[var(--green-dim)] dark:text-emerald-300',
    purple: 'bg-[var(--paper-dim)] text-[var(--ink)] ring-[var(--paper-line)] dark:text-violet-300',
    rose: 'bg-[var(--rust-dim)] text-[var(--rust)] ring-[var(--rust-dim)] dark:text-rose-300',
    slate: 'bg-[var(--paper-dim)] text-[var(--mist)] ring-[var(--paper-line)] dark:text-slate-300',
  }

  return (
    <article className="rounded-[1.75rem] border border-[var(--paper-line)] bg-white p-5 transition duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`grid size-10 place-items-center rounded-lg ring-2 ${tones[tone] || tones.blue}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <p className="mt-4 font-mono text-3xl font-semibold text-[var(--text)]">{value}</p>
    </article>
  )
}

