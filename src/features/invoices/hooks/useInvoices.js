import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../hooks/useAuth'
import { useDebounce } from '../../../hooks/useDebounce'
import { invoiceService } from '../../../services/invoiceService'

const defaultFilters = {
  customerId: '',
  dateBefore: '',
  query: '',
  status: '',
}

export function useInvoices() {
  const { user } = useAuth()
  const [filters, setFilters] = useState(defaultFilters)
  const [invoices, setInvoices] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const debouncedQuery = useDebounce(filters.query, 250)

  const fetchInvoices = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await invoiceService.getInvoices(user.id)

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } else {
      setInvoices(data || [])
    }

    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const customers = useMemo(() => {
    const customerMap = new Map()

    invoices.forEach((invoice) => {
      if (invoice.customers?.id) {
        customerMap.set(invoice.customers.id, invoice.customers)
      }
    })

    return Array.from(customerMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [invoices])

  const filteredInvoices = useMemo(() => {
    const query = debouncedQuery.trim().toLowerCase()

    return invoices.filter((invoice) => {
      const customerName = invoice.customers?.name?.toLowerCase() || ''
      const invoiceNumber = invoice.invoice_number.toLowerCase()
      const matchesQuery =
        !query || invoiceNumber.includes(query) || customerName.includes(query)
      const matchesStatus = !filters.status || invoice.status === filters.status
      const matchesCustomer = !filters.customerId || invoice.customer_id === filters.customerId
      const matchesDate = !filters.dateBefore || invoice.issue_date <= filters.dateBefore

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCustomer &&
        matchesDate
      )
    })
  }, [debouncedQuery, filters, invoices])

  const updateFilter = useCallback((name, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  return {
    customers,
    error,
    filteredInvoices,
    filters,
    invoices,
    isLoading,
    refetch: fetchInvoices,
    resetFilters,
    updateFilter,
  }
}
