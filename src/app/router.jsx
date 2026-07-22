import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppProviders } from './providers'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '../features/auth/components/PublicOnlyRoute'
import {
  BillingPage,
  CustomersPage,
  DashboardPage,
  HelpPage,
  InvoiceCreatePage,
  InvoiceDetailsPage,
  InvoiceEditPage,
  InvoiceListPage,
  LandingPage,
  LoginPage,
  NotFound,
  PrivacyPage,
  SettingsPage,
  SignUpPage,
  TermsPage,
} from './lazyPages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppProviders>
        <LandingPage />
      </AppProviders>
    ),
  },
  {
    path: '/privacy',
    element: (
      <AppProviders>
        <PrivacyPage />
      </AppProviders>
    ),
  },
  {
    path: '/terms',
    element: (
      <AppProviders>
        <TermsPage />
      </AppProviders>
    ),
  },
  {
    path: '/',
    element: (
      <AppProviders>
        <ProtectedRoute />
      </AppProviders>
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'billing', element: <BillingPage /> },
          { path: 'invoices', element: <InvoiceListPage /> },
          { path: 'invoices/new', element: <InvoiceCreatePage /> },
          { path: 'invoices/:invoiceId', element: <InvoiceDetailsPage /> },
          { path: 'invoices/:invoiceId/edit', element: <InvoiceEditPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'help', element: <HelpPage /> },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: (
      <AppProviders>
        <PublicOnlyRoute />
      </AppProviders>
    ),
    children: [
      {
        element: <AuthLayout />,
        children: [
          { index: true, element: <Navigate to="/auth/login" replace /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'sign-up', element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: (
      <AppProviders>
        <NotFound />
      </AppProviders>
    ),
  },
])
