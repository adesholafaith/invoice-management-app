import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/forms/FormInput'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'

export function SignUpPage() {
  const navigate = useNavigate()
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: {
      email: '',
      name: '',
      password: '',
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    setAuthError('')

    try {
      const { error } = await authService.signUp(values)

      if (error) {
        throw error
      }

      toast.success('Account created. Check your email if confirmation is enabled.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(error.message || 'Unable to create your account. Please try again.')
      toast.error(error.message || 'Unable to create your account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      {authError ? (
        <p className="rounded-md border border-[var(--rust-dim)] bg-[var(--rust-dim)] px-3 py-2 text-sm text-[var(--rust)]" role="alert">
          {authError}
        </p>
      ) : null}
      <FormInput
        autoComplete="name"
        error={errors.name}
        id="name"
        label="Name"
        registration={register('name', {
          required: 'Name is required.',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters.',
          },
        })}
      />
      <FormInput
        autoComplete="email"
        error={errors.email}
        id="email"
        label="Email"
        registration={register('email', {
          required: 'Email is required.',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email address.',
          },
        })}
        type="email"
      />
      <FormInput
        autoComplete="new-password"
        error={errors.password}
        id="password"
        label="Password"
        registration={register('password', {
          required: 'Password is required.',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters.',
          },
        })}
        type="password"
      />
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link className="font-medium text-brand-600 dark:text-blue-300" to="/auth/login">
          Log in
        </Link>
      </p>
    </form>
  )
}
