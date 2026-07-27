import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { AiChatBot } from '../feedback/AiChatBot'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 })
  }, [pathname, search])

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--text)] [--paper:#F4F8FF] [--paper-dim:#EAF2FF] [--paper-line:#D8E5F6] dark:bg-slate-950 dark:text-slate-50">
      <Sidebar />
      <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} variant="mobile" />
      <div className="flex min-h-screen flex-col lg:pl-72">
        <Header onMenuClick={() => setIsMobileNavOpen(true)} />
        <main className="workspace-content flex flex-1 flex-col px-4 pb-8 pt-6 sm:px-6 sm:pb-10 lg:pl-12 lg:pr-8 xl:pl-14 xl:pr-8">
          <div className="flex-1 pb-10">
            <Outlet />
          </div>
          <AppFooter />
        </main>
        <AiChatBot />
      </div>
    </div>
  )
}

function AppFooter() {
  return (
    <footer className="mt-auto flex flex-col gap-4 border-t border-[var(--paper-line)] pt-6 text-xs text-[var(--mist)] dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <p>Copyright 2026 Billing. All rights reserved.</p>
      <div className="flex flex-wrap gap-4">
        <Link className="hover:text-[var(--text)]" to="/privacy">
          Privacy Policy
        </Link>
        <Link className="hover:text-[var(--text)]" to="/terms">
          Terms of Service
        </Link>
        <Link className="hover:text-[var(--text)]" to="/help">
          Help Center
        </Link>
        <a className="hover:text-[var(--text)]" href="mailto:support@billing.app">
          Contact Support
        </a>
      </div>
    </footer>
  )
}
