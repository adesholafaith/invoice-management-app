import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '../../../components/ui/Button'
import { FormInput } from '../../../components/forms/FormInput'
import { FormTextarea } from '../../../components/forms/FormTextarea'

const defaultValues = {
  billing_address: '',
  company: '',
  email: '',
  name: '',
  notes: '',
  phone: '',
}

export function CustomerForm({ customer, isSubmitting, onCancel, onSubmit }) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm({ defaultValues })

  useEffect(() => {
    reset(customer || defaultValues)
  }, [customer, reset])

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          autoComplete="name"
          error={errors.name}
          id="customer-name"
          label="Client name"
          registration={register('name', {
            required: 'Client name is required.',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters.',
            },
          })}
        />
        <FormInput
          autoComplete="organization"
          error={errors.company}
          id="customer-company"
          label="Company"
          registration={register('company')}
        />
        <FormInput
          autoComplete="email"
          error={errors.email}
          id="customer-email"
          label="Email"
          registration={register('email', {
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address.',
            },
          })}
          type="email"
        />
        <FormInput
          autoComplete="tel"
          error={errors.phone}
          id="customer-phone"
          label="Phone"
          registration={register('phone')}
          type="tel"
        />
      </div>

      <FormTextarea
        autoComplete="street-address"
        error={errors.billing_address}
        id="customer-billing-address"
        label="Billing address"
        registration={register('billing_address')}
        rows={3}
      />
      <FormTextarea
        error={errors.notes}
        id="customer-notes"
        label="Notes"
        registration={register('notes')}
        rows={3}
      />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button className="w-44 px-6 sm:px-6" disabled={isSubmitting} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
        <Button className="w-44 px-6 sm:px-6" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : 'Save client'}
        </Button>
      </div>
    </form>
  )
}

