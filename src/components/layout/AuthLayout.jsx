import { Link, Outlet } from 'react-router-dom'
import { BrandLogo } from '../ui/BrandLogo'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--paper)] px-4 py-10 text-[var(--text)]">
      <section className="animate-ledgerly-pop w-full max-w-md rounded-lg border border-[var(--paper-line)] bg-white p-6">
        <div className="mb-8">
          <Link className="inline-flex items-center" aria-label="Billing home" to="/">
            <BrandLogo iconClassName="size-10" variant="black" />
          </Link>
          <h1 className="mt-2 text-2lg font-semibold">Manage invoices with confidence</h1>
        </div>
        <Outlet />
      </section>
    </main>
  )
}

