import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiCheckCircle, FiCreditCard, FiRefreshCw } from 'react-icons/fi'
import { Button } from '../../components/ui/Button'
import { pricingPlans } from '../../config/billing'
import { useSubscription } from '../../features/billing/hooks/useSubscription'
import { billingService } from '../../services/billingService'
import { formatDate } from '../../utils/dates'

export function BillingPage() {
  const { error, isLoading, isPremium, refetch, subscription } = useSubscription()
  const [checkoutPlan, setCheckoutPlan] = useState(null)

  async function handleSubscribe(plan) {
    if (isPremium && subscription.plan === plan) {
      toast('This is your current plan.')
      return
    }

    setCheckoutPlan(plan)

    try {
      const data = await billingService.startCheckout(plan)

      if (!data?.authorization_url) {
        throw new Error('Paystack did not return a checkout URL.')
      }

      window.location.href = data.authorization_url
    } catch (checkoutError) {
      toast.error(checkoutError.message || 'Unable to start Paystack checkout.')
    } finally {
      setCheckoutPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Subscribe to unlock invoice PDF downloads and browser printing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Current plan</p>
              <h3 className="mt-1 text-xl font-semibold capitalize">
                {isPremium ? `${subscription.plan} plan` : 'Free plan'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {isPremium
                  ? `PDF and print are unlocked${subscription.current_period_end ? ` until ${formatDate(subscription.current_period_end)}` : ''}.`
                  : 'PDF downloads and printing are locked on the free plan.'}
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold capitalize text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <FiCreditCard aria-hidden="true" />
              {subscription.status}
            </span>
          </div>
        </section>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          <h3 className="font-semibold">Unable to load subscription</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={refetch} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {pricingPlans.map((plan) => (
          (() => {
            const isCurrentPlan = isPremium && subscription.plan === plan.plan

            return (
          <article
            className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
            key={plan.plan}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">{plan.label}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {plan.description}
                </p>
              </div>
              {subscription.plan === plan.plan && isPremium ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
                  Active
                </span>
              ) : null}
            </div>

            <p className="mt-6 text-4xl font-bold">
              {plan.price}
              <span className="text-base font-medium text-slate-500 dark:text-slate-400">
                /{plan.interval}
              </span>
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <Feature>Download professional invoice PDFs</Feature>
              <Feature>Print invoices from the browser</Feature>
              <Feature>Keep all free client and invoice tools</Feature>
            </ul>

            <Button
              className="mt-6 min-w-40 px-8 sm:px-8"
              disabled={isLoading || checkoutPlan === plan.plan || isCurrentPlan}
              onClick={() => handleSubscribe(plan.plan)}
            >
              {isCurrentPlan ? 'Current plan' : checkoutPlan === plan.plan ? 'Opening checkout...' : `Subscribe ${plan.label}`}
            </Button>
          </article>
            )
          })()
        ))}
      </section>
    </div>
  )
}

function Feature({ children }) {
  return (
    <li className="flex gap-2">
      <FiCheckCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[#0B0F17] dark:text-white" />
      <span>{children}</span>
    </li>
  )
}
