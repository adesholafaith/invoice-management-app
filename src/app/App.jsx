import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { Skeleton } from '../components/feedback/Skeleton'

export default function App() {
  return (
    <Suspense fallback={<AppFallback />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

function AppFallback() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    </main>
  )
}
