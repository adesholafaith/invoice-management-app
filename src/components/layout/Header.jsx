import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiBell, FiMenu, FiSearch, FiUser, FiX } from 'react-icons/fi'
import { IconButton } from '../ui/IconButton'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import { useDebounce } from '../../hooks/useDebounce'
import { workspaceSearchService } from '../../services/workspaceSearchService'

export function Header({ onMenuClick }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isSearchSuggestionsOpen, setIsSearchSuggestionsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const notificationsRef = useRef(null)
  const desktopSearchRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const mobileSearchInputRef = useRef(null)
  const debouncedSearchQuery = useDebounce(searchQuery, 220)
  const { isLoading, markAllRead, notifications, unreadCount } = useNotifications()
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  const firstName = displayName?.trim().split(/\s+/)[0]

  useEffect(() => {
    function handlePointerDown(event) {
      if (!notificationsRef.current?.contains(event.target)) {
        setIsNotificationsOpen(false)
      }

      if (
        !mobileSearchRef.current?.contains(event.target) &&
        !desktopSearchRef.current?.contains(event.target)
      ) {
        setIsMobileSearchOpen(false)
        setIsSearchSuggestionsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsNotificationsOpen(false)
        setIsMobileSearchOpen(false)
        setIsSearchSuggestionsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true
    const query = debouncedSearchQuery.trim()

    if (query.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return undefined
    }

    setIsSearching(true)
    workspaceSearchService.search(user?.id, query).then(({ data }) => {
      if (isCurrent) {
        setSearchResults(data || [])
        setIsSearching(false)
      }
    })

    return () => {
      isCurrent = false
    }
  }, [debouncedSearchQuery, user?.id])

  function openNotifications() {
    setIsNotificationsOpen((current) => !current)
    markAllRead()
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const query = String(formData.get('workspace-search') || '').trim()

    setIsMobileSearchOpen(false)
    setIsSearchSuggestionsOpen(false)
    navigate(query ? `/invoices?query=${encodeURIComponent(query)}` : '/invoices')
  }

  function openMobileSearch() {
    setIsMobileSearchOpen((current) => !current)
    setIsSearchSuggestionsOpen(true)
    window.setTimeout(() => mobileSearchInputRef.current?.focus(), 120)
  }

  function handleSearchChange(event) {
    setSearchQuery(event.target.value)
    setIsSearchSuggestionsOpen(true)
  }

  function closeSearchPanels() {
    setIsMobileSearchOpen(false)
    setIsSearchSuggestionsOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--paper-line)] bg-[var(--paper)]/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-6 lg:pl-12 lg:pr-8 xl:pl-14 xl:pr-8">
      <div className="flex items-center justify-between gap-3">
        <IconButton
          aria-label="Open navigation"
          className="lg:hidden"
          icon={<FiMenu aria-hidden="true" />}
          onClick={onMenuClick}
        />
        <div className="relative hidden sm:block" ref={desktopSearchRef}>
          <form
            aria-label="Search invoices and clients"
            className="flex w-60 min-w-0 items-center gap-2 rounded-md border border-[var(--paper-line)] bg-[var(--paper-dim)] px-3 py-2 text-sm text-[var(--mist)] dark:border-slate-800 dark:bg-slate-900 md:w-64"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <FiSearch aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">Search dashboard</span>
            <input
              className="w-full min-w-0 bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--mist)]"
              name="workspace-search"
              onChange={handleSearchChange}
              onFocus={() => setIsSearchSuggestionsOpen(true)}
              placeholder="Search"
              type="search"
              value={searchQuery}
            />
          </form>
          <SearchSuggestions
            isLoading={isSearching}
            isOpen={isSearchSuggestionsOpen && searchQuery.trim().length >= 2}
            onClose={closeSearchPanels}
            query={searchQuery}
            results={searchResults}
          />
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative sm:hidden" ref={mobileSearchRef}>
            <IconButton
              aria-expanded={isMobileSearchOpen}
              aria-haspopup="dialog"
              aria-label="Open search"
              icon={isMobileSearchOpen ? <FiX aria-hidden="true" /> : <FiSearch aria-hidden="true" />}
              onClick={openMobileSearch}
            />
            {isMobileSearchOpen ? (
              <form
                aria-label="Search invoices and clients"
                className="animate-workspace-search-slide absolute right-0 top-0 z-30 flex h-10 w-[min(calc(100vw-7.5rem),17rem)] origin-right items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white px-3 text-sm text-[var(--mist)]"
                onSubmit={handleSearchSubmit}
                role="search"
              >
                <FiSearch aria-hidden="true" className="size-4 shrink-0" />
                <input
                  className="w-full min-w-0 bg-transparent text-[var(--text)] outline-none placeholder:text-[var(--mist)]"
                  name="workspace-search"
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchSuggestionsOpen(true)}
                  placeholder="Search invoices"
                  ref={mobileSearchInputRef}
                  type="search"
                  value={searchQuery}
                />
              </form>
            ) : null}
            <SearchSuggestions
              isLoading={isSearching}
              isOpen={isMobileSearchOpen && isSearchSuggestionsOpen && searchQuery.trim().length >= 2}
              onClose={closeSearchPanels}
              query={searchQuery}
              results={searchResults}
            />
          </div>
          <div className="relative" ref={notificationsRef}>
            <IconButton
              aria-expanded={isNotificationsOpen}
              aria-haspopup="menu"
              aria-label="Notifications"
              icon={
                <span className="relative">
                  <FiBell aria-hidden="true" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-2 -top-2 grid min-h-4 min-w-4 place-items-center rounded-full bg-[var(--rust)] px-1 text-[10px] font-bold leading-none text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </span>
              }
              onClick={openNotifications}
            />
            {isNotificationsOpen ? (
              <div
                className="absolute right-0 z-30 mt-2 w-[min(calc(100vw-1.5rem),18rem)] overflow-hidden rounded-xl border border-[var(--paper-line)] bg-white shadow-[var(--app-shadow-md)] dark:border-slate-800 dark:bg-slate-900 sm:w-80"
                role="menu"
              >
                <div className="border-b border-[var(--paper-line)] px-3 py-2.5 dark:border-slate-800 sm:px-4 sm:py-3">
                  <p className="text-sm font-semibold sm:text-base">Notifications</p>
                  <p className="mt-1 text-xs text-[var(--mist)] dark:text-slate-400">
                    Updates about invoices, billing, and payment activity.
                  </p>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5 sm:max-h-96 sm:p-2">
                  {isLoading ? (
                    <p className="px-3 py-3 text-sm text-[var(--mist)]">Loading notifications...</p>
                  ) : null}
                  {!isLoading && notifications.length === 0 ? (
                    <p className="px-3 py-3 text-sm text-[var(--mist)]">You're all caught up.</p>
                  ) : null}
                  {!isLoading
                    ? notifications.map((notification) => (
                        <Link
                          className="block rounded-lg px-3 py-2.5 transition hover:bg-[var(--paper-dim)] dark:hover:bg-slate-800"
                          key={notification.id}
                          onClick={() => setIsNotificationsOpen(false)}
                          role="menuitem"
                          to={notification.to}
                        >
                          <span className="block text-sm font-semibold leading-5 text-[var(--text)] dark:text-white">
                            {notification.title}
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[var(--mist)] dark:text-slate-400 sm:text-sm">
                            {notification.message}
                          </span>
                        </Link>
                      ))
                    : null}
                </div>
              </div>
            ) : null}
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white py-1 pl-2 pr-3 dark:border-slate-800 dark:bg-slate-900 sm:flex">
            {avatarUrl ? (
              <img
                alt=""
                className="size-8 rounded-full object-cover"
                referrerPolicy="no-referrer"
                src={avatarUrl}
              />
            ) : (
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[var(--paper-dim)] text-[var(--ink)] dark:bg-slate-800 dark:text-slate-200">
                <FiUser aria-hidden="true" />
              </span>
            )}
            <span className="max-w-32 truncate text-sm font-medium text-[var(--text)] dark:text-slate-300">
              {firstName || 'Profile'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function SearchSuggestions({ isLoading, isOpen, onClose, query, results }) {
  if (!isOpen) return null

  return (
    <div
      className="absolute right-0 top-full z-40 mt-2 w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-lg border border-[var(--paper-line)] bg-white text-left"
      role="listbox"
    >
      <div className="border-b border-[var(--paper-line)] px-3 py-2 text-xs font-medium uppercase tracking-[0.02em] text-[var(--mist)]">
        Search results
      </div>

      {isLoading ? (
        <p className="px-3 py-3 text-sm text-[var(--mist)]">Searching...</p>
      ) : null}

      {!isLoading && results.length === 0 ? (
        <p className="px-3 py-3 text-sm italic text-[var(--mist)]">item not found</p>
      ) : null}

      {!isLoading && results.length > 0 ? (
        <div className="max-h-72 overflow-y-auto p-1.5">
          {results.map((result) => (
            <Link
              className="block rounded-md px-3 py-2 transition hover:bg-[var(--paper-dim)] focus:bg-[var(--paper-dim)] focus:outline-none"
              key={result.id}
              onClick={onClose}
              role="option"
              to={result.href}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-semibold text-[var(--text)]">
                  {result.label}
                </span>
                <span className="shrink-0 rounded-full bg-[var(--paper-dim)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.02em] text-[var(--ink)]">
                  {result.type}
                </span>
              </span>
              {result.meta ? (
                <span className="mt-1 block truncate text-xs text-[var(--mist)]">
                  {result.meta}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="border-t border-[var(--paper-line)] px-3 py-2 text-[11px] text-[var(--mist)]">
        Press Enter to search invoices for "{query.trim()}"
      </div>
    </div>
  )
}

