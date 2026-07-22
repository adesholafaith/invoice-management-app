import { Navigate, Outlet } from 'react-router-dom'
import { Skeleton } from '../../../components/feedback/Skeleton'
import { useAuth } from '../../../hooks/useAuth'

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-72 w-full" />
        </div>
      </main>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
