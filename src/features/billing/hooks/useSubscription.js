import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../../hooks/useAuth'
import { freeSubscription, subscriptionService } from '../../../services/subscriptionService'

export function useSubscription() {
  const { user } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscription, setSubscription] = useState(freeSubscription)

  const fetchSubscription = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await subscriptionService.getSubscription(user.id)

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
      setSubscription(freeSubscription)
    } else {
      setSubscription(data)
    }

    setIsLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const isPremium = useMemo(() => {
    if (!['active', 'non-renewing'].includes(subscription.status)) return false
    if (!subscription.current_period_end) return true

    return new Date(subscription.current_period_end) > new Date()
  }, [subscription])

  return {
    error,
    isLoading,
    isPremium,
    refetch: fetchSubscription,
    subscription,
  }
}
