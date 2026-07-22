import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { customerService } from '../../../services/customerService'
import { invoiceService } from '../../../services/invoiceService'
import { useAuth } from '../../../hooks/useAuth'

export function useInvoiceSetup() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSetup = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const [customersResponse, invoiceNumberResponse] = await Promise.all([
      customerService.getCustomers(user.id),
      invoiceService.generateInvoiceNumber(user.id),
    ])

    if (customersResponse.error || invoiceNumberResponse.error) {
      const message =
        customersResponse.error?.message ||
        invoiceNumberResponse.error?.message ||
        'Unable to load invoice setup.'
      setError(message)
      toast.error(message)
    } else {
      setCustomers(customersResponse.data || [])
      setInvoiceNumber(invoiceNumberResponse.data)
    }

    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    loadSetup()
  }, [loadSetup])

  return {
    customers,
    error,
    invoiceNumber,
    isLoading,
    refetch: loadSetup,
  }
}
