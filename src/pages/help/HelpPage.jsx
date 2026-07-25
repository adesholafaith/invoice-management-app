import { Link } from 'react-router-dom'
import {
  FiCreditCard,
  FiFileText,
  FiHelpCircle,
  FiMail,
  FiMessageCircle,
  FiPrinter,
  FiUsers,
} from 'react-icons/fi'
import { Button } from '../../components/ui/Button'

const helpTopics = [
  {
    description:
      'Create an invoice, add line items, choose payment terms, and let Billing calculate totals automatically.',
    href: '/invoices/new',
    icon: FiFileText,
    title: 'Create and manage invoices',
  },
  {
    description:
      'Add client contact details, company information, and billing addresses for faster invoicing.',
    href: '/customers',
    icon: FiUsers,
    title: 'Clients',
  },
  {
    description:
      'Download, print, and email polished invoices when your subscription is active.',
    href: '/billing',
    icon: FiPrinter,
    title: 'PDF, print, and email',
  },
  {
    description:
      'Review your plan, upgrade to Pro, and understand which premium tools are unlocked.',
    href: '/billing',
    icon: FiCreditCard,
    title: 'Billing and subscription',
  },
]

const faqs = [
  {
    answer:
      'Open Invoices, select Create invoice, choose a client, add your items, and save. You can keep it as Draft or move it to Pending when it is ready.',
    question: 'How do I create my first invoice?',
  },
  {
    answer:
      'Open the invoice details page. If your subscription is active, use Download PDF, Print, or Email from the invoice actions.',
    question: 'How do I send or download an invoice?',
  },
  {
    answer:
      'Open an invoice and change its status to Paid. Billing can then create a receipt based on the payment record.',
    question: 'How do receipts work?',
  },
  {
    answer:
      'Free users can create invoices and manage clients. Premium tools like PDF download, printing, and invoice email sending require a subscription.',
    question: 'What is included in the free plan?',
  },
]

export function HelpPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-lg border border-[var(--paper-line)] bg-white p-6 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
            Help & Support
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-slate-950">
            Get unstuck quickly and keep your billing workflow moving.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Find quick answers for invoices, clients, subscriptions, receipts, exports, and
            account setup.
          </p>
        </div>

        <div className="bg-[#0B0F17] p-5 text-white">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/10">
            <FiMessageCircle aria-hidden="true" className="size-5" />
          </span>
          <h3 className="mt-4 text-lg font-semibold">Need a fast answer?</h3>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Use Billing Assistant for instant guidance while you work.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {helpTopics.map((topic) => {
          const Icon = topic.icon

          return (
            <Link
              className="group rounded-lg border border-[var(--paper-line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#0B0F17]"
              key={topic.title}
              to={topic.href}
            >
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-[#0B0F17] text-white">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <h3 className="mt-5 text-base font-semibold text-slate-950">{topic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{topic.description}</p>
            </Link>
          )
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-[var(--paper-line)] bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#0B0F17] text-white">
              <FiHelpCircle aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Common questions</h3>
              <p className="text-sm text-slate-500">Short answers for everyday Billing tasks.</p>
            </div>
          </div>

          <div className="mt-6 divide-y divide-slate-200">
            {faqs.map((faq) => (
              <article className="py-5 first:pt-0 last:pb-0" key={faq.question}>
                <h4 className="font-semibold text-slate-950">{faq.question}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[var(--paper-line)] bg-white p-5">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-[#0B0F17] text-white">
              <FiMail aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">Contact support</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Send us a message if you need help with billing, setup, exports, or account access.
            </p>
            <a href="mailto:support@billing.app">
              <Button className="mt-5" variant="secondary">
                Email support
              </Button>
            </a>
          </div>

        </aside>
      </section>
    </div>
  )
}


