import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FcGoogle } from 'react-icons/fc'
import { Link, useNavigate } from 'react-router-dom'
import { FormInput } from '../../components/forms/FormInput'
import { Button } from '../../components/ui/Button'
import { authService } from '../../services/authService'

export function LoginPage() {
  const navigate = useNavigate()
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

    try {
      const { error } = await authService.signIn(values)

      if (error) {
        throw error
      }

      toast.success('Welcome back.')
      navigate('/', { replace: true })
    } catch (error) {
      toast.error(error.message || 'Unable to log in. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setIsSubmitting(true)

    try {
      const { error } = await authService.signInWithGoogle()

      if (error) {
        throw error
      }
    } catch (error) {
      toast.error(error.message || 'Unable to continue with Google.')
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <Button
        className="w-full"
        disabled={isSubmitting}
        onClick={handleGoogleLogin}
        type="button"
        variant="secondary"
      >
        <FcGoogle aria-hidden="true" className="size-5" />
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        or
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>
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
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
      <p className="text-center text-sm text-slate-500 dark:text-slate-400">
        New here?{' '}
        <Link className="font-medium text-brand-600 dark:text-blue-300" to="/auth/sign-up">
          Create an account
        </Link>
      </p>
    </form>
  )
}
