import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center dark:bg-slate-950">
      <div>
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">404</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The page you are looking for does not exist.
        </p>
        <Link
          className="btn-premium-gradient mt-6 inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-extrabold tracking-wide transition duration-300 hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
          to="/dashboard"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}
