import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { customerService } from '../../../services/customerService'
import { useAuth } from '../../../hooks/useAuth'

export function useCustomers() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState([])
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCustomers = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await customerService.getCustomers(user.id)

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } else {
      setCustomers(data || [])
    }

    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  async function createCustomer(values) {
    const { data, error: createError } = await customerService.createCustomer(user.id, values)

    if (createError) {
      throw createError
    }

    setCustomers((currentCustomers) => [withEmptyBillingStats(data), ...currentCustomers])
    return data
  }

  async function updateCustomer(customerId, values) {
    const { data, error: updateError } = await customerService.updateCustomer(customerId, values)

    if (updateError) {
      throw updateError
    }

    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === customerId ? { ...customer, ...data } : customer,
      ),
    )
    return data
  }

  async function deleteCustomer(customerId) {
    const { error: deleteError } = await customerService.deleteCustomer(customerId)

    if (deleteError) {
      throw deleteError
    }

    setCustomers((currentCustomers) =>
      currentCustomers.filter((customer) => customer.id !== customerId),
    )
  }

  return {
    customers,
    deleteCustomer,
    error,
    isLoading,
    refetch: fetchCustomers,
    saveCustomer: (values, customerId) =>
      customerId ? updateCustomer(customerId, values) : createCustomer(values),
  }
}

function withEmptyBillingStats(customer) {
  return {
    ...customer,
    billing_currency: 'USD',
    invoice_count: 0,
    total_billed: 0,
    total_billed_by_currency: {},
  }
}
