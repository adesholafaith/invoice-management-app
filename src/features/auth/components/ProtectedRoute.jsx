import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useAuth } from '../../../hooks/useAuth'

export function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
