import { FiSearch } from 'react-icons/fi'
import { Button } from '../../../components/ui/Button'

export function InvoiceFilters({ customers, filters, onReset, onUpdate }) {
  return (
    <section className="rounded-lg border border-[var(--paper-line)] bg-white p-4">
      <div className="grid min-w-0 gap-3 md:grid-cols-2 lg:grid-cols-[1fr_160px_200px_180px_auto]">
        <label className="relative min-w-0 md:col-span-2 lg:col-span-1">
          <span className="sr-only">Search invoices and clients</span>
          <FiSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />
          <input
            className="block min-h-10 min-w-0 max-w-full w-full rounded-md border border-[var(--paper-line)] bg-white pl-9 pr-3 text-sm text-[var(--text)] outline-none transition hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)]"
            onChange={(event) => onUpdate('query', event.target.value)}
            placeholder="Search invoices / clients..."
            type="search"
            value={filters.query}
          />
        </label>

        <FilterSelect
          label="Status"
          onChange={(value) => onUpdate('status', value)}
          value={filters.status}
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </FilterSelect>

        <FilterSelect
          label="Client"
          onChange={(value) => onUpdate('customerId', value)}
          value={filters.customerId}
        >
          <option value="">All clients</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </FilterSelect>

        <FilterInput
          label="Show invoices before selected date"
          onChange={(value) => onUpdate('dateBefore', value)}
          type="date"
          value={filters.dateBefore}
        />

        <Button className="justify-self-start" onClick={onReset} variant="secondary">
          Reset Filters
        </Button>
      </div>
    </section>
  )
}

function FilterInput({ label, onChange, type = 'text', value }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <input
        className="block min-h-10 min-w-0 max-w-full w-full rounded-md border border-[var(--paper-line)] bg-white px-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text)] transition hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)]"
        onBlur={(event) => {
          if (!event.target.value && type === 'date') {
            event.target.type = 'text'
          }
        }}
        onChange={(event) => onChange(event.target.value)}
        onFocus={(event) => {
          if (type === 'date') {
            event.target.type = 'date'
          }
        }}
        placeholder={type === 'date' ? 'Date' : undefined}
        type={type === 'date' && !value ? 'text' : type}
        value={value}
      />
    </label>
  )
}

function FilterSelect({ children, label, onChange, value }) {
  return (
    <label className="block min-w-0">
      <span className="sr-only">{label}</span>
      <select
        className="block min-h-10 min-w-0 max-w-full w-full rounded-md border border-[var(--paper-line)] bg-white px-3.5 py-2 pr-9 text-sm text-[var(--text)] outline-none transition hover:border-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)]"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {children}
      </select>
    </label>
  )
}



