import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FiRefreshCw } from 'react-icons/fi'
import { Skeleton } from '../../components/feedback/Skeleton'
import { FormInput } from '../../components/forms/FormInput'
import { FormTextarea } from '../../components/forms/FormTextarea'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { emptyProfile, profileService } from '../../services/profileService'

export function SettingsPage() {
  const { user } = useAuth()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({ defaultValues: emptyProfile })

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await profileService.getProfile(user.id)

    if (fetchError) {
      setError(fetchError.message)
      toast.error(fetchError.message)
    } else {
      reset({
        ...emptyProfile,
        ...data,
        email: data.email || user.email || '',
      })
    }

    setIsLoading(false)
  }, [reset, user?.email, user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function onSubmit(values) {
    setIsSaving(true)

    try {
      const { data, error: saveError } = await profileService.upsertProfile(user.id, values)

      if (saveError) {
        throw saveError
      }

      reset({ ...emptyProfile, ...data })
      toast.success('Company profile saved.')
    } catch (saveError) {
      toast.error(saveError.message || 'Unable to save company profile.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage the company details that appear on invoices, PDFs, and invoice emails.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-10 w-64" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-24 md:col-span-2" />
          </div>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
          <h3 className="font-semibold">Unable to load settings</h3>
          <p className="mt-1 text-sm">{error}</p>
          <Button className="mt-4" onClick={fetchProfile} variant="secondary">
            <FiRefreshCw aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error ? (
        <form
          className="rounded-lg border border-slate-200 bg-white p-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              error={errors.company_name}
              id="company-name"
              label="Company name"
              registration={register('company_name', {
                required: 'Company name is required.',
              })}
            />
            <FormInput
              error={errors.contact_name}
              id="contact-name"
              label="Contact name"
              registration={register('contact_name')}
            />
            <FormInput
              error={errors.email}
              id="profile-email"
              label="Email"
              registration={register('email', {
                pattern: {
                  message: 'Enter a valid email address.',
                  value: /^\S+@\S+\.\S+$/,
                },
              })}
              type="email"
            />
            <FormInput
              error={errors.phone}
              id="profile-phone"
              label="Phone"
              registration={register('phone')}
            />
            <FormInput
              error={errors.website}
              id="profile-website"
              label="Website"
              registration={register('website')}
              type="url"
            />
            <FormInput
              error={errors.tax_id}
              id="tax-id"
              label="Tax ID"
              registration={register('tax_id')}
            />
            <div className="md:col-span-2">
              <FormTextarea
                error={errors.address}
                id="profile-address"
                label="Business address"
                registration={register('address')}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <FormTextarea
                error={errors.invoice_footer}
                id="invoice-footer"
                label="Invoice footer"
                placeholder="Payment terms, bank details, or a short thank-you note."
                registration={register('invoice_footer')}
                rows={4}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save settings'}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

