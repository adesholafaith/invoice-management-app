import { Link } from 'react-router-dom'
import { BrandLogo } from '../../components/ui/BrandLogo'

const privacySections = [
  {
    title: 'Information we collect',
    text: 'Billing stores the account, client, invoice, payment, and company profile details you add so the product can create invoices, receipts, exports, and dashboard summaries.',
  },
  {
    title: 'How we use your data',
    text: 'Your data is used to run your billing workspace, protect your account, process subscriptions, provide support, and improve the reliability of Billing.',
  },
  {
    title: 'Data security',
    text: 'Business records are stored with authenticated access controls. Keep your account credentials private and contact support immediately if you suspect unauthorized access.',
  },
  {
    title: 'Support',
    text: 'For privacy questions or account requests, contact support@billing.app.',
  },
]

const termsSections = [
  {
    title: 'Using Billing',
    text: 'You are responsible for the accuracy of invoices, client records, tax values, payment details, and business information entered into your workspace.',
  },
  {
    title: 'Subscriptions',
    text: 'Paid plans unlock premium actions such as PDF downloads, printing, invoice email sending, and receipt exports. Subscription access depends on successful payment confirmation.',
  },
  {
    title: 'Acceptable use',
    text: 'Do not use Billing for unlawful activity, spam, fraudulent invoices, or attempts to access data that does not belong to your account.',
  },
  {
    title: 'Service changes',
    text: 'Billing may update product features, pricing, limits, and policies as the service grows. Material changes should be communicated clearly to users.',
  },
]

export function PrivacyPage() {
  return <LegalPage eyebrow="Privacy" sections={privacySections} title="Privacy Policy" />
}

export function TermsPage() {
  return <LegalPage eyebrow="Terms" sections={termsSections} title="Terms of Service" />
}

function LegalPage({ eyebrow, sections, title }) {
  return (
    <main className="min-h-screen bg-[var(--paper)] px-4 py-10 text-[var(--text)] sm:px-6 lg:px-10">
      <section className="mx-auto max-w-3xl rounded-lg border border-[var(--paper-line)] bg-white p-6 sm:p-8">
        <Link className="inline-flex items-center" aria-label="Billing home" to="/">
          <BrandLogo iconClassName="size-10" variant="black" />
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--mist)]">
          Last updated July 20, 2026. This page gives users a clear product policy baseline before launch.
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <article key={section.title}>
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--mist)]">{section.text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-[var(--paper-line)] pt-6">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#0B0F17] bg-white px-4 text-xs font-semibold uppercase tracking-[0.02em] text-[#0B0F17] transition hover:bg-[var(--paper-dim)]"
            to="/"
          >
            Back home
          </Link>
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#0B0F17] px-4 text-xs font-semibold uppercase tracking-[0.02em] text-white transition hover:bg-[#1D222B]"
            href="mailto:support@billing.app"
          >
            Contact support
          </a>
        </div>
      </section>
    </main>
  )
}
