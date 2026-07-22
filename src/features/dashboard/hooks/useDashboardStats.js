import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../hooks/useAuth'
import { customerService } from '../../../services/customerService'
import { invoiceService } from '../../../services/invoiceService'

export function useDashboardStats() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const [invoiceResult, customerResult] = await Promise.all([
      invoiceService.getInvoices(user.id),
      customerService.getCustomers(user.id),
    ])

    const fetchError = invoiceResult.error || customerResult.error

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } else {
      setInvoices(invoiceResult.data || [])
      setCustomers(customerResult.data || [])
    }

    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid')
    const pendingInvoices = invoices.filter((invoice) => invoice.status === 'pending')
    const overdueInvoices = invoices.filter((invoice) => invoice.status === 'overdue')
    const draftInvoices = invoices.filter((invoice) => invoice.status === 'draft')
    const weekStart = getStartOfWeek()
    const monthStart = getStartOfMonth()
    const invoicesCreatedThisWeek = invoices.filter((invoice) =>
      isOnOrAfter(invoice.created_at, weekStart),
    ).length
    const customersCreatedThisMonth = customers.filter((customer) =>
      isOnOrAfter(customer.created_at, monthStart),
    ).length
    const paidRevenue = paidInvoices.reduce((total, invoice) => total + Number(invoice.total || 0), 0)
    const outstandingRevenue = [...pendingInvoices, ...overdueInvoices].reduce(
      (total, invoice) => total + Number(invoice.total || 0),
      0,
    )
    const overdueRevenue = overdueInvoices.reduce(
      (total, invoice) => total + Number(invoice.total || 0),
      0,
    )
    const currency = invoices[0]?.currency || 'USD'

    return {
      currency,
      customerCount: customers.length,
      customersCreatedThisMonth,
      draftCount: draftInvoices.length,
      invoicesCreatedThisWeek,
      overdueCount: overdueInvoices.length,
      overdueRevenue,
      paidCount: paidInvoices.length,
      paidRevenue,
      pendingCount: pendingInvoices.length,
      outstandingRevenue,
      totalCount: invoices.length,
    }
  }, [customers, invoices])

  const recentInvoices = useMemo(() => invoices.slice(0, 5), [invoices])

  return {
    customers,
    error,
    invoices,
    isLoading,
    recentInvoices,
    refetch: fetchStats,
    stats,
  }
}

function getStartOfWeek() {
  const date = new Date()
  const day = date.getDay()
  const daysSinceMonday = day === 0 ? 6 : day - 1

  date.setDate(date.getDate() - daysSinceMonday)
  date.setHours(0, 0, 0, 0)

  return date
}

function getStartOfMonth() {
  const date = new Date()
  date.setDate(1)
  date.setHours(0, 0, 0, 0)

  return date
}

function isOnOrAfter(value, date) {
  if (!value) return false

  return new Date(value) >= date
}
