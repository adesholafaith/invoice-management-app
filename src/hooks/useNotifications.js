import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSubscription } from '../features/billing/hooks/useSubscription'
import { invoiceService } from '../services/invoiceService'
import { formatDate } from '../utils/dates'
import { useAuth } from './useAuth'

function getStorageKey(userId) {
  return `ledgerly-seen-notifications-${userId}`
}

function daysUntil(dateValue) {
  const today = new Date()
  const target = new Date(`${dateValue}T00:00:00`)
  today.setHours(0, 0, 0, 0)

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

export function useNotifications() {
  const { user } = useAuth()
  const { isPremium, subscription } = useSubscription()
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [seenIds, setSeenIds] = useState([])

  const fetchInvoices = useCallback(async () => {
    if (!user?.id) {
      setInvoices([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const { data } = await invoiceService.getInvoices(user.id)
    setInvoices(data || [])
    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => {
    if (!user?.id) return

    try {
      const saved = window.localStorage.getItem(getStorageKey(user.id))
      setSeenIds(saved ? JSON.parse(saved) : [])
    } catch {
      setSeenIds([])
    }
  }, [user?.id])

  const notifications = useMemo(() => {
    const activeInvoices = invoices.filter((invoice) => invoice.status !== 'paid')
    const overdueInvoices = activeInvoices.filter(
      (invoice) => invoice.status === 'overdue' || daysUntil(invoice.due_date) < 0,
    )
    const dueSoonInvoices = activeInvoices.filter((invoice) => {
      const days = daysUntil(invoice.due_date)
      return invoice.status === 'pending' && days >= 0 && days <= 7
    })
    const draftInvoices = invoices.filter((invoice) => invoice.status === 'draft')
    const nextNotifications = []

    if (overdueInvoices.length > 0) {
      nextNotifications.push({
        id: `overdue-${overdueInvoices.length}`,
        message: `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? 's are' : ' is'} overdue and need follow-up.`,
        title: 'Overdue invoices',
        to: '/invoices?status=overdue',
      })
    }

    if (dueSoonInvoices.length > 0) {
      const nextDue = dueSoonInvoices
        .map((invoice) => invoice.due_date)
        .sort((a, b) => a.localeCompare(b))[0]

      nextNotifications.push({
        id: `due-soon-${dueSoonInvoices.length}-${nextDue}`,
        message: `${dueSoonInvoices.length} pending invoice${dueSoonInvoices.length > 1 ? 's are' : ' is'} due by ${formatDate(nextDue)}.`,
        title: 'Payment due soon',
        to: '/invoices?status=pending',
      })
    }

    if (draftInvoices.length > 0) {
      nextNotifications.push({
        id: `drafts-${draftInvoices.length}`,
        message: `${draftInvoices.length} draft invoice${draftInvoices.length > 1 ? 's are' : ' is'} waiting to be sent.`,
        title: 'Draft invoices',
        to: '/invoices?status=draft',
      })
    }

    if (!isPremium) {
      nextNotifications.push({
        id: 'free-plan-upgrade',
        message: 'Upgrade to download PDFs, print invoices, and email invoices to clients.',
        title: 'Free plan limits',
        to: '/billing',
      })
    } else if (subscription.current_period_end && daysUntil(subscription.current_period_end) <= 14) {
      nextNotifications.push({
        id: `subscription-renewal-${subscription.current_period_end}`,
        message: `Your ${subscription.plan} plan renews on ${formatDate(subscription.current_period_end)}.`,
        title: 'Subscription renewal',
        to: '/billing',
      })
    }

    if (invoices.length === 0) {
      nextNotifications.push({
        id: 'create-first-invoice',
        message: 'Create your first invoice to start tracking revenue and payments.',
        title: 'Welcome to Billing',
        to: '/invoices/new',
      })
    }

    return nextNotifications
  }, [invoices, isPremium, subscription.current_period_end, subscription.plan])

  const unreadCount = notifications.filter((notification) => !seenIds.includes(notification.id)).length

  function markAllRead() {
    if (!user?.id) return

    const ids = notifications.map((notification) => notification.id)
    setSeenIds(ids)
    window.localStorage.setItem(getStorageKey(user.id), JSON.stringify(ids))
  }

  return {
    isLoading,
    markAllRead,
    notifications,
    refetch: fetchInvoices,
    unreadCount,
  }
}

