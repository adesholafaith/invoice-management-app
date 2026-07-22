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
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { authService } from '../../services/authService'

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
  const isMobile = variant === 'mobile'
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  const firstName = displayName?.trim().split(/\s+/)[0]

  if (isMobile && !isOpen) return null

  async function handleLogout() {
    try {
      const { error } = await authService.signOut()

      if (error) {
        throw error
      }

      toast.success('Logged out.')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Unable to log out. Please try again.')
    }
  }

  const sidebar = (
    <aside
      className={cn(
        'fixed inset-y-0 z-40 flex w-[min(18rem,calc(100vw-2rem))] flex-col bg-[var(--ink)] px-4 py-5 text-white dark:bg-slate-950',
        isMobile
          ? 'right-0 border-l border-white/10 dark:border-slate-800'
          : 'left-0 border-r border-white/10 dark:border-slate-800',
        !isMobile && 'hidden lg:flex',
      )}
    >
      <div className="mb-8 flex items-start justify-between gap-3">
        <Link
          className="font-serif text-lg font-bold text-white hover:text-[#F3EAD4] dark:text-white"
          onClick={onClose}
          to="/"
        >
          Billing
        </Link>
        {isMobile ? (
          <IconButton
            aria-label="Close navigation"
            icon={<FiX aria-hidden="true" />}
            onClick={onClose}
          />
        ) : null}
      </div>
      <p className="-mt-7 mb-8 text-sm text-white/50 dark:text-slate-400">
        Invoice operations
      </p>

      <nav aria-label="Main navigation" className="space-y-1">
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
      <div className="mt-auto border-t border-white/10 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3 dark:bg-slate-900">
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
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{firstName || 'User Profile'}</p>
            <p className="text-xs text-white/50 dark:text-slate-400">User Profile</p>
          </div>
        </div>
        <button
          className="mt-3 flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <FiLogOut aria-hidden="true" className="size-4" />
          Logout
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

