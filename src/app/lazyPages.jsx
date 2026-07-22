import { lazy } from 'react'

export const CustomersPage = lazy(() =>
  import('../pages/customers/CustomersPage').then((module) => ({ default: module.CustomersPage })),
)

export const BillingPage = lazy(() =>
  import('../pages/billing/BillingPage').then((module) => ({ default: module.BillingPage })),
)

export const DashboardPage = lazy(() =>
  import('../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)

export const HelpPage = lazy(() =>
  import('../pages/help/HelpPage').then((module) => ({ default: module.HelpPage })),
)

export const InvoiceCreatePage = lazy(() =>
  import('../pages/invoices/InvoiceCreatePage').then((module) => ({
    default: module.InvoiceCreatePage,
  })),
)

export const InvoiceDetailsPage = lazy(() =>
  import('../pages/invoices/InvoiceDetailsPage').then((module) => ({
    default: module.InvoiceDetailsPage,
  })),
)

export const InvoiceEditPage = lazy(() =>
  import('../pages/invoices/InvoiceEditPage').then((module) => ({
    default: module.InvoiceEditPage,
  })),
)

export const InvoiceListPage = lazy(() =>
  import('../pages/invoices/InvoiceListPage').then((module) => ({
    default: module.InvoiceListPage,
  })),
)

export const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
)

export const LandingPage = lazy(() =>
  import('../pages/landing/LandingPage').then((module) => ({ default: module.LandingPage })),
)

export const NotFound = lazy(() =>
  import('../pages/NotFound').then((module) => ({ default: module.NotFound })),
)

export const PrivacyPage = lazy(() =>
  import('../pages/legal/LegalPages').then((module) => ({ default: module.PrivacyPage })),
)

export const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

export const SignUpPage = lazy(() =>
  import('../pages/auth/SignUpPage').then((module) => ({ default: module.SignUpPage })),
)

export const TermsPage = lazy(() =>
  import('../pages/legal/LegalPages').then((module) => ({ default: module.TermsPage })),
)
