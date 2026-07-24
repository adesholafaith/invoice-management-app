import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/forms/FormInput'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'

export function LoginPage() {
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
      password: '',
    },
  })

  async function onSubmit(values) {
    setIsSubmitting(true)
    setAuthError('')

    try {
      const { error } = await authService.signIn(values)

      if (error) {
        throw error
      }

      toast.success('Welcome back.')
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(error.message || 'Unable to log in. Please try again.')
      toast.error(error.message || 'Unable to log in. Please try again.')
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
        autoComplete="current-password"
        error={errors.password}
        id="password"
        label="Password"
        registration={register('password', {
          required: 'Password is required.',
        })}
        type="password"
      />
      <div className="grid w-full place-items-center">
        <Button className="min-w-24" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>
      </div>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link className="font-medium text-brand-600 dark:text-blue-300" to="/auth/sign-up">
          Create an account
        </Link>
      </p>
    </form>
  )
}
