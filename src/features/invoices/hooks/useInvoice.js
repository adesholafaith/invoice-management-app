import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { invoiceService } from '../../../services/invoiceService'

export function useInvoice(invoiceId) {
  const [invoice, setInvoice] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await invoiceService.getInvoice(invoiceId)

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } else {
      setInvoice(data)
    }

    setIsLoading(false)
  }, [invoiceId])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  return {
    error,
    invoice,
    isLoading,
    refetch: fetchInvoice,
    setInvoice,
  }
}
