import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FiCreditCard,
  FiFileText,
  FiGrid,
  FiHome,
  FiHelpCircle,
  FiLogOut,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { IconButton } from '../ui/IconButton'
import { BrandLogo } from '../ui/BrandLogo'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'
import { useSubscription } from '../../features/billing/hooks/useSubscription'

const navItems = [
  { label: 'Home', href: '/', icon: FiHome },
  { label: 'Dashboard', href: '/dashboard', icon: FiGrid },
  { label: 'Invoices', href: '/invoices', icon: FiFileText },
  { label: 'Clients', href: '/customers', icon: FiUsers },
  { label: 'Subscription', href: '/billing', icon: FiCreditCard },
  { label: 'Settings', href: '/settings', icon: FiSettings },
  { label: 'Help & Support', href: '/help', icon: FiHelpCircle },
]

export function Sidebar({ isOpen = false, onClose, variant = 'desktop' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isPremium, subscription } = useSubscription()
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const isMobile = variant === 'mobile'
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  const firstName = displayName?.trim().split(/\s+/)[0]
  const currentPlan = isPremium ? `${subscription.plan || 'Pro'} plan` : 'Free plan'

  if (isMobile && !isOpen) return null

  async function handleLogout() {
    try {
      const { error } = await authService.signOut()

      if (error) {
        throw error
      }

      toast.success('Logged out.')
      navigate('/', { replace: true })
      onClose?.()
    } catch (error) {
      toast.error(error.message || 'Unable to log out. Please try again.')
    }
  }

  const sidebar = (
    <aside
      className={cn(
        'fixed inset-y-0 z-40 flex h-dvh max-h-dvh w-[min(18rem,calc(100vw-2rem))] flex-col overflow-hidden bg-[var(--ink)] px-4 py-5 text-white dark:bg-slate-950',
        isMobile
          ? 'right-0 border-l border-white/10 dark:border-slate-800'
          : 'left-0 border-r border-white/10 dark:border-slate-800',
        !isMobile && 'hidden lg:flex',
      )}
    >
      <div className={cn('flex shrink-0 items-start justify-between gap-3', isMobile ? 'mb-6' : 'mb-8')}>
        <Link
          className="inline-flex items-center"
          onClick={onClose}
          aria-label="Billing home"
          to="/"
        >
          <BrandLogo
            className="mr-1 inline-flex size-9 items-center justify-center rounded-full bg-white"
            iconClassName="size-9"
            textClassName="!text-white"
            variant="black"
          />
        </Link>
        {isMobile ? (
          <IconButton
            aria-label="Close navigation"
            icon={<FiX aria-hidden="true" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <p
        className={cn(
          'shrink-0 text-sm text-white/50 dark:text-slate-400',
          isMobile ? '-mt-5 mb-6' : '-mt-7 mb-8',
        )}
      >
        Invoice operations
      </p>

      <nav
        aria-label="Main navigation"
        className={cn(
          'min-h-0 flex-1 space-y-1 overflow-y-auto pr-1',
          isMobile && 'pb-28',
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={`${item.label}-${item.href}`}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                  isActive && 'bg-white text-[var(--ink)] dark:bg-blue-950/60 dark:text-blue-200',
                )
              }
            >
              <Icon aria-hidden="true" className="size-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div
        className={cn(
          'border-t border-white/10 pt-4 dark:border-slate-800',
          isMobile ? 'absolute bottom-4 left-4 right-4' : 'relative mt-4 shrink-0',
        )}
      >
        {isProfileMenuOpen ? (
          <div className="absolute bottom-full left-0 right-0 mb-3 overflow-hidden rounded-lg bg-white py-1.5 text-[var(--ink)]">
            <Link
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition hover:bg-[var(--paper-dim)]"
              onClick={() => {
                setIsProfileMenuOpen(false)
                onClose?.()
              }}
              to="/billing"
            >
              <FiCreditCard aria-hidden="true" className="size-3" />
              {isPremium ? 'Manage plan' : 'Upgrade plan'}
            </Link>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-s font-small text-[var(--rust)] transition hover:bg-[var(--rust-dim)]"
              onClick={handleLogout}
              type="button"
            >
              <FiLogOut aria-hidden="true" className="size-3" />
              Logout
            </button>
          </div>
        ) : null}

        <button
          aria-expanded={isProfileMenuOpen}
          className="group flex w-full items-center gap-3 rounded-lg bg-white/10 p-3 text-left transition hover:bg-white/15 dark:bg-slate-900"
          onClick={() => setIsProfileMenuOpen((current) => !current)}
          type="button"
        >
          {avatarUrl ? (
            <img
              alt=""
              className="size-10 rounded-full object-cover"
              referrerPolicy="no-referrer"
              src={avatarUrl}
            />
          ) : (
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-[var(--ink)] dark:bg-slate-800 dark:text-slate-200">
              <FiUser aria-hidden="true" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{firstName || 'User'}</span>
            <span className="block text-xs capitalize text-white/50 dark:text-slate-400">
              {currentPlan}
            </span>
          </span>
          <FiLogOut
            aria-hidden="true"
            className="size-4 shrink-0 self-center text-white/50 transition group-hover:text-white"
          />
        </button>
      </div>
    </aside>
  )

  if (!isMobile) {
    return sidebar
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        aria-label="Close navigation overlay"
        className="absolute inset-0 bg-slate-950/60"
        onClick={onClose}
        type="button"
      />
      {sidebar}
    </div>
  )
}
