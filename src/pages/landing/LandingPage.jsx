import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation } from 'react-router-dom'
import {
  FiArrowRight,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiLayers,
  FiLock,
  FiMail,
  FiMenu,
  FiPieChart,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
  FiTwitter,
  FiUsers,
  FiX,
} from 'react-icons/fi'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTiktok } from 'react-icons/fa'
import { BrandLogo } from '../../components/ui/BrandLogo'

const features = [
  {
    title: 'Invoices and receipts',
    description: 'Create polished invoices with line items, tax, discounts, statuses and PDF exports.',
    icon: FiFileText,
    image: '/invoice.png',
  },
  {
    title: 'Client Database',
    description: 'Keep billing contacts, company details, addresses and notes organized in one place.',
    icon: FiUsers,
    image: '/customers.png',
  },
  {
    title: 'Revenue dashboard',
    description: 'See paid, pending, overdue and outstanding totals without building spreadsheets.',
    icon: FiPieChart,
    image: '/dashboard.png',
  },
  {
    title: 'Document templates',
    description: 'Use consistent invoice layouts for clean client-facing paperwork every time.',
    icon: FiLayers,
    image: '/templates.png',
  },
  {
    title: 'Status tracking',
    description: 'Move invoices from draft to pending, paid, or overdue as your work gets billed.',
    icon: FiRefreshCw,
    image: '/status.png',
  },
  {
    title: 'PDF invoice generation',
    description: 'Generate professional PDF invoices instantly, ready to download, print or share with your clients.',
    icon: FiSmartphone,
    image: '/pdf.png',
  },
]

const faqs = [
  {
    answer:
      'Billing is designed for freelancers, consultants, agencies, and small businesses that want a simple way to create invoices, manage clients, and track payments without the complexity of traditional accounting software.',
    details: [
      'Billing is designed for freelancers, consultants, agencies, and small businesses that want a simple billing workspace.',
      'You can create invoices, manage clients, and track payments without the complexity of traditional accounting software.',
    ],
    question: 'Who is Billing for?',
  },
  {
    answer:
      'Yes. You can get started with our free plan and create, manage, and organize your invoices. Upgrade whenever you need advanced features like professional PDF exports and premium tools.',
    details: [
      'Yes. You can start with the free plan and create, manage, and organize invoices from your workspace.',
      'When you need professional PDF exports, invoice email, and premium tools, you can upgrade without changing your workflow.',
    ],
    question: 'Can I use Billing for free?',
  },
  {
    answer:
      'Absolutely. Add your company details, choose your preferred currency, set invoice defaults, and create professional invoices that reflect your brand.',
    details: [
      'Absolutely. Add company details, client information, your preferred currency, and invoice defaults.',
      'Billing helps you create polished invoices that feel consistent with your business and are easy for clients to understand.',
    ],
    question: 'Can I customize my invoices?',
  },
  {
    answer:
      'Yes. Easily keep track of whether an invoice is Draft, Sent, Paid, Pending, or Overdue, so you always know what needs your attention.',
    details: [
      'Yes. Billing keeps invoice status visible so you always know what needs action.',
      'Track Draft, Sent, Paid, Pending, and Overdue invoices without digging through email threads or spreadsheets.',
    ],
    question: 'Can I track payment status?',
  },
  {
    answer:
      'Yes. Your data is securely stored and only accessible to your account, giving you peace of mind while managing your business.',
    details: [
      'Yes. Your records are stored securely and scoped to your account.',
      'Billing is built around authenticated access, so your business data stays private while you manage invoices and clients.',
    ],
    question: 'Are my business records secure?',
  },
  {
    answer:
      'Yes. Billing lets you generate polished, client-ready PDF invoices that are easy to share, print, or save for your records.',
    details: [
      'Yes. Paid plans unlock polished PDF invoices that are ready for clients.',
      'You can download, print, or save invoice PDFs for your own records and client communication.',
    ],
    question: 'Can I download invoices as PDFs?',
  },
  {
    answer:
      'Yes. Billing is fully responsive, so you can manage invoices, clients, and payments from your desktop, tablet, or phone.',
    details: [
      'Yes. Billing is responsive across desktop, tablet, and mobile screens.',
      'You can review clients, invoices, and payment activity whether you are at your desk or checking in on the go.',
    ],
    question: 'Does Billing work on mobile devices?',
  },
  {
    answer:
      'Not at all. Billing is built with simplicity in mind, making it easy for anyone to create professional invoices and stay organized.',
    details: [
      'Not at all. Billing is built for people who want to invoice clearly without learning accounting software first.',
      'The interface focuses on practical everyday tasks: clients, invoices, statuses, totals, and exports.',
    ],
    question: 'Do I need accounting experience?',
  },
]

const workflowSteps = [
  {
    title: 'Get started in minutes',
    description: "Set up your business, customize your invoice settings and add clients so you're ready to send your first invoice.",
    icon: FiClipboard,
    image: '/step1.png',
  },
  {
    title: 'Create and track invoices',
    description: "Create polished invoices, manage payments and keep every client's billing history organized in one place.",
    icon: FiFileText,
    image: '/step2.png',
  },
  {
    title: 'Share, export & get paid',
    description: 'Download client-ready PDF, share invoices with clients and unlock advanced tools as your business expands..',
    icon: FiCreditCard,
    image: '/step3.png',
  },
]

const reasons = [
  {
    title: 'Everything in one place',
    description: 'Clients, invoice items, statuses, payments and dashboard metrics all live in one organized dashboard.',
    icon: FiCheckCircle,
    image: '/dashboard.png',
  },
  {
    title: 'Your data is protected',
    description: 'Your business information is securely stored and accessible only to you, so you can work with confidence.',
    icon: FiShield,
    image: '/status.png',
  },
  {
    title: 'Ready for client-facing documents',
    description: 'Professional PDF exports, company settings and currency-aware totals make invoices look polished.',
    icon: FiDownload,
    image: '/pdf.png',
  },
  {
    title: 'Designed for small teams',
    description: "Whether you're just starting out or managing a growing client base, Billing lets you stay organized always.",
    icon: FiTrendingUp,
    image: '/customers.png',
  },
]

const testimonials = [
  {
    name: 'Adaeze Okafor',
    quote: 'Creating invoices takes minutes instead of hours. Everything I need is in one place.',
    role: 'Freelance Designer',
  },
  {
    name: 'Tunde Adebayo',
    quote: 'The PDF invoices look incredibly professional. Clients have even commented on how polished they are.',
    role: 'Creative Agency Owner',
  },
  {
    name: 'Amina Bello',
    quote: 'I finally know which invoices are paid, pending, or overdue without digging through emails.',
    role: 'Business Consultant',
  },
  {
    name: 'Chinedu Nwosu',
    quote: 'Managing client information alongside invoices has made my workflow much more organized.',
    role: 'Studio Founder',
  },
  {
    name: 'Kemi Balogun',
    quote: 'The dashboard makes it easy to see how my business is performing at a glance.',
    role: 'Independent Consultant',
  },
  {
    name: 'Tobi Martins',
    quote: "Simple, fast and beautifully designed. It's exactly what I wanted from an invoicing tool.",
    role: 'Small Business Owner',
  },
]

const homepagePricingPlans = [
  {
    buttonLabel: 'Get Started Free',
    description: 'Perfect for freelancers and small businesses getting started.',
    features: [
      'Create and manage invoices',
      'Manage clients',
      'Dashboard overview',
      'Basic invoice tracking',
      'Save invoice records securely',
    ],
    label: 'Free',
    price: 'NGN 0',
    toAuthenticated: '/dashboard',
  },
  {
    buttonLabel: 'Start Monthly Plan',
    description: 'Everything you need to send polished client-ready invoices.',
    features: [
      'Unlimited invoices',
      'Unlimited clients',
      'Download and print PDF invoices',
      'Email invoices to clients',
      'Advanced dashboard & analytics',
      'Priority support',
      'Early access to new updates',
    ],
    interval: 'month',
    label: 'Monthly',
    price: 'NGN 999',
  },
  {
    badge: 'Best Value',
    buttonLabel: 'Start Yearly Plan',
    description: 'Save more with annual billing while keeping every premium export feature.',
    features: [
      'Everything in Monthly',
      'Unlimited invoices',
      'Unlimited clients',
      'Download, print, and email invoices',
      'Advanced dashboard & analytics',
      'Priority support',
      'Save NGN 2,000 compared to paying monthly',
    ],
    interval: 'year',
    label: 'Yearly',
    price: 'NGN 10,000',
  },
]

const footerLinks = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Why choose us', href: '#why-choose-us' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Contact', href: '#contact' },
      { label: 'FAQ', href: '#faq' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
    ],
  },
  {
    title: 'WORKSPACE',
    links: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'Invoices', to: '/invoices' },
      { label: 'Clients', to: '/customers' },
      { label: 'Billing', to: '/billing' },
    ],
  },
]

const homeMenuLinks = [
  { label: 'Home', to: '/' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Features', href: '#features' },
  { label: 'Invoices', to: '/invoices' },
  { label: 'FAQ', href: '#faq' },
]

const homeMenuSocials = [
  { label: 'Instagram', href: 'https://www.instagram.com', icon: FaInstagram },
  { label: 'X', href: 'https://x.com', icon: FiTwitter },
  { label: 'TikTok', href: 'https://www.tiktok.com', icon: FaTiktok },
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: FaLinkedinIn },
]

const footerSocials = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com', icon: FaLinkedinIn },
  { label: 'X', href: 'https://x.com', icon: FiTwitter },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: FaInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com', icon: FaFacebookF },
]

const contactSubjectOptions = [
  'General question',
  'Account support',
  'Billing and subscription',
  'Feature request',
  'Report a problem',
  'Partnership enquiry',
]

export function LandingPage() {
  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY
      const isNearTop = currentScrollY < 24
      const isScrollingUp = currentScrollY < lastScrollYRef.current - 8
      const isScrollingDown = currentScrollY > lastScrollYRef.current + 8

      if (isNearTop || isScrollingUp) {
        setIsHeaderVisible(true)
      } else if (isScrollingDown && !isHomeMenuOpen) {
        setIsHeaderVisible(false)
      }

      lastScrollYRef.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isHomeMenuOpen])

  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <header
        className={`fixed left-0 right-0 top-0 z-30 bg-white/90 backdrop-blur transition-transform duration-300 dark:bg-slate-950/90 ${
          isHeaderVisible || isHomeMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <nav
          aria-label="Public navigation"
          className="mx-auto grid max-w-7xl grid-cols-[auto_1fr] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8"
        >
          <Link className="inline-flex items-center" aria-label="Billing home" to="/">
            <BrandLogo
              className="inline-flex size-11 items-center justify-center rounded-full bg-[#0B0F17]"
              iconClassName="size-11"
              textClassName="!text-[17px] !text-[#0B0F17]"
              variant="white"
            />
          </Link>
          <div className="flex items-center justify-end gap-3">
            <button
              aria-controls="home-menu"
              aria-expanded={isHomeMenuOpen}
              aria-label="Open menu"
              className="inline-flex size-11 items-center justify-center rounded-full border border-transparent bg-white text-slate-950 shadow-sm transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95 dark:bg-slate-900 dark:text-white"
              onClick={() => setIsHomeMenuOpen(true)}
              type="button"
            >
              <FiMenu aria-hidden="true" className="text-xl" />
            </button>
          </div>
        </nav>
        <HomeMenu
          isOpen={isHomeMenuOpen}
          onClose={() => setIsHomeMenuOpen(false)}
        />
      </header>

      <section id="invoice" className="mx-auto grid max-w-7xl scroll-mt-16 gap-8 px-4 pb-20 pt-32 sm:px-6 sm:pb-12 sm:pt-36 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center lg:px-8 lg:pb-10 lg:pt-40">
        <div className="min-w-0 flex flex-col justify-center py-5">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
            FOR FREELANCERS AND BUSINESSES
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            <span className="block">Invoice Smarter.</span>
            <span className="block">
              <span className="text-blue-700">Get Paid</span> Faster.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-1xl leading-8 text-slate-600 dark:text-slate-300">
            Billing helps freelancers, consultants and small businesses create invoices, manage
            clients, track payments, export PDFs and grow from one simple billing workspace.
          </p>
          <div className="mt-8 flex flex-row gap-2 sm:gap-3">
            <Link
              className="btn-gradient-outline inline-flex min-h-9 items-center justify-center rounded-full px-3 text-xs font-semibold tracking-wide !text-[#0B0F17] hover:-translate-y-0.5 hover:!text-[#0B0F17] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:px-5"
              to="/dashboard"
            >
              Get Started
            </Link>
            <Link
              className="btn-premium-gradient inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:px-5"
              to="/invoices/new">
              Create invoice
            </Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 pt-6">
            <MiniMetric label="Documents" value="Invoices" />
            <MiniMetric label="Exports" value="PDF" />
            <MiniMetric label="Access" value="Secure" />
          </div>
        </div>

        <ProductPreview />
      </section>

      <section id="features" className="scroll-mt-0 bg-white pb-10 pt-6 dark:bg-slate-950 sm:pb-14 sm:pt-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Features
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
            Designed to Help You Save Time.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-slate-600 dark:text-slate-300">
            Bring invoices, clients, tracking and exports into one workspace that stays easy to use as your business grows.
          </p>
          <FeatureCarousel />
        </div>
      </section>

      <HowItWorksSection />

      <WhyChooseUsSection />

      <section
        id="pricing"
        className="scroll-mt-16 bg-white py-10 dark:bg-slate-950 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Pricing
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
            Start free, unlock export of documents.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-slate-600 dark:text-slate-300">
            Start with the essentials for free, then upgrade when you are ready to export, print and email professional invoices.
          </p>
          <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3">
            {homepagePricingPlans.map((plan) => (
              <PricingCard
                badge={plan.badge}
                buttonLabel={plan.buttonLabel}
                description={plan.description}
                features={plan.features}
                interval={plan.interval}
                key={plan.label}
                label={plan.label}
                price={plan.price}
                toAuthenticated={plan.toAuthenticated}
              />
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <FAQSection />
      
      <ContactSection />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-lg bg-slate-950 px-6 py-10 text-center text-white dark:bg-blue-950 sm:py-12">
          <FiLock aria-hidden="true" className="mx-auto size-8 text-white" />
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">Ready to simplify your paperwork?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Open your workspace and start managing clients, invoices, PDF exports, and revenue
            tracking from one polished workspace.
          </p>
          <Link
            className="btn-gradient-outline btn-outline-light mt-8 inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.02em] transition duration-300 hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600 sm:px-5"
            to="/dashboard"
          >
            Open workspace
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white pb-6 pt-12 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
            <div>
              <Link className="inline-flex items-center" aria-label="Billing home" to="/">
                <BrandLogo
                  className="inline-flex size-10 items-center justify-center rounded-full bg-[#0B0F17]"
                  iconClassName="size-10"
                  textClassName="!text-[17px] !text-[#0B0F17]"
                  variant="white"
                />
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-6">
                Invoice management for clients, line items, PDF exports, payments, and revenue
                tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <h3 className="text-base font-semibold text-slate-950 dark:text-white">{group.title}</h3>
                  <ul className="mt-3 space-y-2.5 text-sm leading-6">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        {link.to ? (
                          <Link className="hover:text-blue-700" to={link.to}>
                            {link.label}
                          </Link>
                        ) : (
                          <a className="hover:text-blue-700" href={link.href}>
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            <p className="text-xs text-slate-500">Copyright 2026 Billing. All rights reserved.</p>
            <div className="flex shrink-0 items-center gap-2">
              {footerSocials.map((social) => {
                const Icon = social.icon

                return (
                  <a
                    aria-label={`Billing on ${social.label}`}
                    className="inline-flex size-7 items-center justify-center rounded-full border border-slate-200 text-[11px] text-slate-600 transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 dark:border-slate-800 dark:text-slate-300"
                    href={social.href}
                    key={social.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <Icon aria-hidden="true" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

function HomeMenu({ isOpen, onClose }) {
  const location = useLocation()

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPaddingRight = document.body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.body.style.paddingRight = previousBodyPaddingRight
    }
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const getMenuLinkClass = (isActive) =>
    `group flex items-center justify-between rounded-2xl px-4 py-3 text-base font-bold transition ${
      isActive
        ? 'bg-slate-50 text-blue-700 dark:bg-slate-900 dark:text-blue-300'
        : 'text-slate-950 hover:bg-slate-50 hover:text-blue-700 dark:text-white dark:hover:bg-slate-900'
    }`
  const getMenuArrowClass = (isActive) =>
    `transition ${isActive ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:translate-x-1 group-hover:opacity-100'}`
  const isMenuLinkActive = (link) => {
    if (link.to) {
      return link.to === '/'
        ? location.pathname === '/' && !location.hash
        : location.pathname === link.to
    }

    return location.pathname === '/' && location.hash === link.href
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close menu"
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-label="Homepage menu"
        aria-modal="true"
        className="absolute right-0 top-0 flex h-dvh w-[min(100vw,440px)] flex-col overflow-y-auto border-l border-white/80 bg-white p-5 shadow-[0_30px_100px_rgba(15,9,40,0.25)] dark:border-slate-800 dark:bg-slate-950"
        id="home-menu"
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4">
          <Link className="inline-flex items-center" aria-label="Billing home" onClick={onClose} to="/">
            <BrandLogo
              className="inline-flex size-10 items-center justify-center rounded-full bg-[#0B0F17]"
              iconClassName="size-10"
              textClassName="!text-[17px] !text-[#0B0F17]"
              variant="white"
            />
          </Link>
          <button
            aria-label="Close menu"
            className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            onClick={onClose}
            type="button"
          >
            <FiX aria-hidden="true" className="text-xl" />
          </button>
        </div>

        <nav aria-label="Homepage menu links" className="mt-8 grid gap-2">
          {homeMenuLinks.map((link) => {
            const isActive = isMenuLinkActive(link)

            return link.to ? (
                <Link
                  className={getMenuLinkClass(isActive)}
                  key={link.label}
                  onClick={onClose}
                  to={link.to}
                >
                  {link.label}
                  <FiArrowRight aria-hidden="true" className={getMenuArrowClass(isActive)} />
                </Link>
              ) : (
                <a
                  className={getMenuLinkClass(isActive)}
                  href={link.href}
                  key={link.label}
                  onClick={onClose}
                >
                  {link.label}
                  <FiArrowRight aria-hidden="true" className={getMenuArrowClass(isActive)} />
                </a>
              )
          })}
        </nav>

        <div className="mt-auto pt-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-500">Socials</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {homeMenuSocials.map((social) => {
              const Icon = social.icon

              return (
                <a
                  aria-label={social.label}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  href={social.href}
                  key={social.label}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" className="text-lg" />
                </a>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function FeatureCarousel() {
  const scrollerRef = useRef(null)
  const isPausedRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return undefined
    }

    let animationFrameId
    let previousTimestamp

    function scrollStep(timestamp) {
      const scroller = scrollerRef.current
      const delta = previousTimestamp ? timestamp - previousTimestamp : 16

      if (scroller && !isPausedRef.current) {
        const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth

        if (maxScrollLeft > 0) {
          if (scroller.scrollLeft >= maxScrollLeft - 1) {
            scroller.scrollLeft = 0
          } else {
            scroller.scrollLeft = Math.min(maxScrollLeft, scroller.scrollLeft + delta * 0.05)
          }
        }
      }

      previousTimestamp = timestamp
      animationFrameId = window.requestAnimationFrame(scrollStep)
    }

    animationFrameId = window.requestAnimationFrame(scrollStep)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false)
    }
  }

  return (
    <div className="relative mt-10">
      <div
        aria-label="Feature carousel"
        className="flex gap-5 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onBlur={handleBlur}
        onFocus={() => setIsPaused(true)}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onPointerEnter={() => setIsPaused(true)}
        onPointerLeave={() => setIsPaused(false)}
        ref={scrollerRef}
      >
        {features.map((feature) => {
          const Icon = feature.icon

          return (
            <article
              className="relative flex min-h-[480px] w-[min(82vw,390px)] shrink-0 flex-col overflow-hidden border border-white/20 bg-blue-950 bg-cover bg-center shadow-[0_18px_50px_rgba(15,9,40,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,9,40,0.13)]"
              key={feature.title}
              style={{ backgroundImage: `url('${feature.image}')` }}
            >
              <div className="absolute inset-0 bg-slate-950/38" />
              <div className="relative z-10 flex h-full flex-1 flex-col justify-start p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/82">
                  {feature.description}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

function ProductPreview() {
  return (
    <div className="relative flex min-h-[360px] min-w-0 items-center justify-center overflow-visible sm:min-h-[460px] md:min-h-[400px] lg:min-h-[560px]">
      <div className="absolute left-[0%] top-[81%] z-20 w-32 -rotate-1 border border-[var(--paper-line)] bg-white px-4 py-3 shadow-[0_18px_40px_rgba(20,24,31,0.10)] sm:left-[4%] sm:top-[74.5%] sm:w-36 md:-left-[2%] md:top-[78%] md:w-32 lg:left-[0%] lg:w-36">
        <p className="text-xs font-medium text-[var(--text)]">Overdue</p>
        <p className="mt-1 whitespace-nowrap font-mono text-sm font-bold text-[var(--rust)] sm:text-base">
          2 invoices
        </p>
      </div>

      <div className="absolute right-[0%] top-[8%] z-20 w-36 rotate-1 border border-[var(--paper-line)] bg-white px-4 py-3 shadow-[0_18px_40px_rgba(20,24,31,0.10)] sm:right-[6%] sm:top-[14%] sm:w-44 md:-right-[2%] md:top-[9%] md:w-40 lg:right-[8%] lg:w-44">
        <p className="text-xs font-medium text-[var(--text)]">Collected this month</p>
        <p className="mt-1 font-mono text-sm font-bold text-[var(--green)] sm:text-base">
          $8,820
        </p>
      </div>

      <article className="relative z-10 w-[min(78vw,390px)] rotate-2 border border-[var(--paper-line)] bg-white px-5 pb-4 pt-7 shadow-[0_24px_60px_rgba(20,24,31,0.13)] sm:w-[440px] sm:px-7 sm:pb-5 sm:pt-8 md:w-[min(100%,360px)] md:px-5 lg:w-[440px] lg:px-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[var(--text)] sm:text-xl">
              Gifted Studio
            </h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.08em] text-[var(--mist)]">
              INV-01042
            </p>
          </div>
          <span className="-mt-1 shrink-0 rotate-[-7deg] border-2 border-[var(--green)] px-2 py-0.5 font-mono text-sm font-bold tracking-[0.12em] text-[var(--green)] sm:px-3 sm:py-1 sm:text-base">
            PAID
          </span>
        </div>

        <div className="mt-8 space-y-3">
          {[
            ['Brand identity - phase 2', '$1,800.00'],
            ['Landing page build', '$950.00'],
            ['Revisions (2 rounds)', '$220.00'],
          ].map(([item, amount]) => (
            <div
              className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-dashed border-[var(--paper-line)] pb-2"
              key={item}
            >
              <p className="truncate text-sm text-[var(--text)]">{item}</p>
              <p className="font-mono text-sm text-[var(--text)]">{amount}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t-2 border-[var(--ink)] pt-3">
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-lg font-bold text-[var(--text)]">Total</p>
            <p className="font-mono text-lg font-bold text-[var(--ink)]">$2,970.00</p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 flex translate-y-1/2 justify-around px-2"
        >
          {Array.from({ length: 16 }).map((_, index) => (
            <span className="size-2.5 rounded-full bg-[var(--paper)]" key={index} />
          ))}
        </div>
      </article>
    </div>
  )
}

function MiniMetric({ label, value }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-white py-10 dark:bg-slate-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          How it works
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
          Create, manage & send invoices.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-slate-600 dark:text-slate-300">
          Move from setup to client-ready invoices through a simple flow that keeps client details, totals and payment status organized.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon

            return (
              <article
                className="relative min-h-[500px] overflow-hidden border border-white/20 bg-blue-950 bg-cover p-6 shadow-[0_18px_50px_rgba(15,9,40,0.08)]"
                key={step.title}
                style={{ backgroundImage: `url('${step.image}')`, backgroundPosition: 'center top' }}
              >
                <div className="absolute inset-0 bg-slate-950/42" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-col items-start gap-3 lg:flex-row lg:items-center">
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                        <Icon aria-hidden="true" />
                      </span>
                      <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                    </div>
                    <span className="hidden shrink-0 text-sm font-bold text-white lg:inline">
                      0{index + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/82">
                    {step.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function WhyChooseUsSection() {
  return (
    <section
      id="why-choose-us"
      className="scroll-mt-16 bg-white py-10 dark:bg-slate-950 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Why choose us
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Professional invoicing without complexity.</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Create professional invoices in minutes, track every payment, manage clients and monitor your business performance from a single dashboard.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => {
            const Icon = reason.icon

            return (
              <article
                className="relative min-h-[300px] overflow-hidden border border-white/20 bg-blue-950 bg-cover p-5 shadow-[0_18px_50px_rgba(15,9,40,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,9,40,0.13)]"
                key={reason.title}
                style={{ backgroundImage: `url('${reason.image}')`, backgroundPosition: 'center top' }}
              >
                <div className="absolute inset-0 bg-slate-950/72 backdrop-blur-[2px]" />
                <div className="relative z-10 flex h-full min-h-[260px] flex-col items-center justify-center text-center">
                  <span className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-semibold text-white">{reason.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/82">
                    {reason.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const tabRefs = useRef([])
  const activeFaq = faqs[activeIndex]

  function selectFaq(index) {
    setActiveIndex(index)
  }

  function handleTabKeyDown(event, index) {
    const lastIndex = faqs.length - 1
    let nextIndex = index

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault()
      nextIndex = index === lastIndex ? 0 : index + 1
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault()
      nextIndex = index === 0 ? lastIndex : index - 1
    } else if (event.key === 'Home') {
      event.preventDefault()
      nextIndex = 0
    } else if (event.key === 'End') {
      event.preventDefault()
      nextIndex = lastIndex
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectFaq(index)
      return
    } else {
      return
    }

    selectFaq(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section id="faq" className="scroll-mt-0 bg-white py-10 dark:bg-slate-950 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            FAQ
          </p>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Everything you need to know about using Billing. 
          </p>
        </div>

        <div className="motion-safe:animate-ledgerly-pop mt-10 overflow-hidden bg-[#0B0F17] px-4 py-5 text-white sm:px-7 sm:py-8 lg:px-10 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div
                aria-label="Frequently asked questions"
                className="grid gap-1 md:block"
                role="tablist"
              >
                {faqs.map((faq, index) => {
                  const isActive = index === activeIndex

                  return (
                    <button
                      aria-controls={`faq-panel-${index}`}
                      aria-selected={isActive}
                      className={`group relative w-full border-b border-white/10 py-3 pl-5 pr-3 text-left transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400 sm:py-4 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 hover:border-blue-400/40 hover:text-slate-100'
                      }`}
                      id={`faq-tab-${index}`}
                      key={faq.question}
                      onClick={() => selectFaq(index)}
                      onKeyDown={(event) => handleTabKeyDown(event, index)}
                      ref={(element) => {
                        tabRefs.current[index] = element
                      }}
                      role="tab"
                      tabIndex={isActive ? 0 : -1}
                      type="button"
                    >
                      <span
                        className={`absolute bottom-3 left-0 top-3 w-0.5 rounded-full bg-blue-500 transition-all duration-300 ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                        }`}
                      />
                      <span className="flex items-center justify-between gap-4">
                        <span className={isActive ? 'text-sm font-semibold sm:text-base' : 'text-sm font-medium'}>
                          {faq.question}
                        </span>
                        <FiArrowRight
                          aria-hidden="true"
                          className={`size-4 shrink-0 text-blue-400 transition duration-300 ${
                            isActive ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-70'
                          }`}
                        />
                      </span>
                    </button>
                  )
                })}
              </div>

            </aside>

            <div>
              <div
                aria-labelledby={`faq-tab-${activeIndex}`}
                className="motion-safe:animate-ledgerly-pop bg-gradient-to-br from-white/[0.12] via-white/[0.07] to-blue-500/[0.08] p-5 backdrop-blur-xl sm:p-8"
                id={`faq-panel-${activeIndex}`}
                key={activeFaq.question}
                role="tabpanel"
                tabIndex={0}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#0B0F17] ring-1 ring-white/25">
                    <FiCheckCircle aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold leading-tight text-white sm:text-2xl">{activeFaq.question}</h3>
                    <div className="mt-4 space-y-4 text-sm leading-7 text-slate-200 sm:text-base">
                      {activeFaq.details.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white/[0.04] p-5 text-center sm:mt-8 sm:p-6">
                <h3 className="text-xl font-bold text-white sm:text-2xl">Ready to simplify your invoicing?</h3>
                <p className="mx-auto mt-3 max-w-2xl text-slate-300">
                  Join businesses using Billing to create professional invoices, manage clients,
                  and get paid.
                </p>
                <Link
                  className="btn-gradient-outline btn-outline-light mt-6 inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-semibold uppercase tracking-[0.02em] transition duration-300 hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-400"
                  to="/invoices/new"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm({
    defaultValues: {
      email: '',
      fullName: '',
      message: '',
      subject: 'General question',
    },
  })

  async function onSubmit() {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 700)
    })

    reset()
    setIsSubmitted(true)
  }

  return (
    <section
      id="contact"
      className="relative isolate scroll-mt-16 overflow-hidden bg-white py-10 dark:bg-slate-950 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            Contact
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
            Need help with invoices, billing or setup?
          </h2>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
            Send us a note and we will help you keep your billing workspace moving smoothly.
          </p>
        </div>

        <div className="relative isolate mt-12 border border-slate-200 bg-white p-5 text-[var(--text)] sm:p-7 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="order-2 space-y-5 lg:order-1">
            <div className="space-y-3">
              <a
                className="group flex items-center gap-4 border-b border-slate-200 bg-white p-4 text-sm text-[var(--text)] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
                href="mailto:support@billing.app"
              >
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                  <FiMail aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-[var(--mist)]">
                    Email support
                  </span>
                  <span className="mt-1 block font-semibold text-[var(--text)]">
                    support@billing.app
                  </span>
                </span>
              </a>
              <div className="flex items-center gap-4 border-b border-slate-200 bg-white p-4 text-sm text-[var(--text)]">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                  <FiClock aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wide text-[var(--mist)]">
                    Typical response time
                  </span>
                  <span className="mt-1 block font-semibold text-[var(--text)]">
                    Within one business day
                  </span>
                </span>
              </div>
            </div>

            <div className="bg-white p-5">
              <p className="text-lg font-semibold">Need a quick answer?</p>
              <p className="mt-2 text-sm leading-6 text-[var(--mist)]">
                Browse common questions about invoices, exports, subscriptions, and account setup.
              </p>
              <a
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--ink)] transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
                href="#faq"
              >
                Visit FAQ

              </a>
            </div>
          </div>

          <div className="order-1 bg-white p-0 lg:order-2">
              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <ContactField
                    error={errors.fullName?.message}
                    id="contact-full-name"
                    label="Full name"
                  >
                    <input
                      aria-describedby={errors.fullName ? 'contact-full-name-error' : undefined}
                      aria-invalid={errors.fullName ? 'true' : 'false'}
                      className="mt-2 min-h-12 w-full border border-[var(--paper-line)] bg-white px-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isSubmitting}
                      id="contact-full-name"
                      placeholder="Full name"
                      type="text"
                      {...register('fullName', {
                        required: 'Please enter your full name.',
                        minLength: {
                          message: 'Name must be at least 2 characters.',
                          value: 2,
                        },
                      })}
                    />
                  </ContactField>

                  <ContactField
                    error={errors.email?.message}
                    id="contact-email"
                    label="Email address"
                  >
                    <input
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      className="mt-2 min-h-12 w-full border border-[var(--paper-line)] bg-white px-4 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)] disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={isSubmitting}
                      id="contact-email"
                      placeholder="you@example.com"
                      type="email"
                      {...register('email', {
                        pattern: {
                          message: 'Enter a valid email address.',
                          value: /^\S+@\S+\.\S+$/,
                        },
                        required: 'Please enter your email address.',
                      })}
                    />
                  </ContactField>
                </div>

                <ContactField
                  error={errors.subject?.message}
                  id="contact-subject"
                  label="Subject"
                  wrapperClassName="mt-5"
                >
                  <select
                    aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                    aria-invalid={errors.subject ? 'true' : 'false'}
                    className="mt-2 min-h-12 w-full border border-[var(--paper-line)] bg-white px-4 text-sm text-[var(--text)] outline-none transition focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSubmitting}
                    id="contact-subject"
                    {...register('subject', {
                      required: 'Please choose a subject.',
                    })}
                  >
                    {contactSubjectOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </ContactField>

                <ContactField
                  error={errors.message?.message}
                  id="contact-message"
                  label="Message"
                  wrapperClassName="mt-5"
                >
                  <textarea
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    aria-invalid={errors.message ? 'true' : 'false'}
                    className="mt-2 min-h-40 w-full resize-y border border-[var(--paper-line)] bg-white px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--mist)] focus:border-[var(--ink)] focus:ring-4 focus:ring-[rgba(20,24,31,0.10)] disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSubmitting}
                    id="contact-message"
                    placeholder="Tell us what you need help with."
                    {...register('message', {
                      required: 'Please enter a message.',
                      minLength: {
                        message: 'Message must be at least 10 characters.',
                        value: 10,
                      },
                    })}
                  />
                </ContactField>

                <div className="mt-7 flex flex-col items-center">
                  <button
                    className="inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--ink)] bg-white px-4 !text-[12px] font-semibold uppercase tracking-[0.01em] text-[var(--ink)] transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--paper-dim)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--ink)]"
                    disabled={isSubmitting || isSubmitted}
                    type="submit"
                  >
                    {isSubmitted ? 'Sent' : isSubmitting ? 'Sending...' : 'Send message'}
                  </button>
                  <p className="mt-4 max-w-xl text-xs leading-5 text-[var(--mist)]">
                    We use your details only to respond to your message. We never sell your information or add you to marketing lists without consent.
                  </p>
                </div>
              </form>
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactField({ children, error, id, label, wrapperClassName = '' }) {
  return (
    <div className={wrapperClassName}>
      <label className="text-sm font-semibold text-[var(--text)]" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-2 text-sm text-[var(--rust)]" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-16 bg-white py-10 dark:bg-slate-950 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          Testimonials
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl text-center text-2xl font-bold sm:text-3xl">
          Loved by freelancers and growing businesses
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center leading-7 text-slate-600 dark:text-slate-300">
          See how Billing helps businesses simplify invoicing, stay organized, and get paid faster.
        </p>
        <TestimonialsCarousel />
      </div>
    </section>
  )
}

function TestimonialsCarousel() {
  const scrollerRef = useRef(null)
  const isPausedRef = useRef(false)
  const dragStateRef = useRef({ isDragging: false, scrollLeft: 0, startX: 0 })
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      return undefined
    }

    let animationFrameId
    let previousTimestamp

    function scrollStep(timestamp) {
      const scroller = scrollerRef.current
      const delta = previousTimestamp ? timestamp - previousTimestamp : 16

      if (scroller && !isPausedRef.current) {
        const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth

        if (maxScrollLeft > 0) {
          scroller.scrollLeft =
            scroller.scrollLeft >= maxScrollLeft - 1 ? 0 : scroller.scrollLeft + delta * 0.035
        }
      }

      previousTimestamp = timestamp
      animationFrameId = window.requestAnimationFrame(scrollStep)
    }

    animationFrameId = window.requestAnimationFrame(scrollStep)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  function handlePointerDown(event) {
    const scroller = scrollerRef.current

    if (!scroller) {
      return
    }

    dragStateRef.current = {
      isDragging: true,
      scrollLeft: scroller.scrollLeft,
      startX: event.clientX,
    }
    scroller.setPointerCapture(event.pointerId)
    setIsPaused(true)
  }

  function handlePointerMove(event) {
    const scroller = scrollerRef.current
    const dragState = dragStateRef.current

    if (!scroller || !dragState.isDragging) {
      return
    }

    scroller.scrollLeft = dragState.scrollLeft - (event.clientX - dragState.startX)
  }

  function endDrag(event) {
    const scroller = scrollerRef.current

    if (scroller?.hasPointerCapture(event.pointerId)) {
      scroller.releasePointerCapture(event.pointerId)
    }

    dragStateRef.current.isDragging = false
    setIsPaused(false)
  }

  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsPaused(false)
    }
  }

  return (
    <div
      aria-label="Client testimonials"
      className="mt-10 flex cursor-grab gap-5 overflow-x-auto overscroll-x-contain active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onBlur={handleBlur}
      onFocus={() => setIsPaused(true)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onPointerCancel={endDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      ref={scrollerRef}
    >
      {testimonials.map((testimonial) => {
        const initials = testimonial.name
          .split(' ')
          .map((part) => part[0])
          .join('')

        return (
          <article
            className="flex min-h-[320px] w-[min(84vw,360px)] shrink-0 flex-col bg-[#0B0F17] p-6 text-white transition duration-300 hover:-translate-y-1"
            key={testimonial.name}
          >
            <p className="text-sm font-semibold tracking-wide text-amber-400" aria-label="5 out of 5 stars">
              ★★★★★
            </p>
            <p className="mt-8 text-lxl font-medium leading-7 text-white">
              "{testimonial.quote}"
            </p>
            <div className="mt-auto flex items-end gap-5 pt-8">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-white/12 text-sm font-bold text-white ring-1 ring-white/20">
                  {initials}
                </span>
                <span>
                  <span className="block font-semibold text-white">{testimonial.name}</span>
                  <span className="mt-1 block text-sm text-white/62">{testimonial.role}</span>
                </span>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function PricingCard({
  badge,
  buttonLabel,
  description,
  features,
  interval,
  label,
  price,
  toAuthenticated = '/billing',
}) {
  const isFeatured = Boolean(badge)

  return (
    <article
      className={`relative flex h-full flex-col overflow-hidden border bg-white p-6 transition hover:-translate-y-1 dark:bg-slate-900 ${
        isFeatured
          ? 'border-[#0B0F17] dark:border-white'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {badge ? (
        <span className="absolute right-4 top-4 rounded-full bg-blue-700 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {badge}
        </span>
      ) : null}
      <h3 className="pr-24 text-xl font-semibold">{label}</h3>
      <p className="mt-5 flex items-end gap-1 text-4xl font-bold">
        {price}
        {interval ? (
          <span className="pb-1 text-base font-medium text-slate-500 dark:text-slate-400">
            /{interval}
          </span>
        ) : null}
      </p>
      <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      <div className="my-6 h-px bg-slate-200 dark:bg-slate-800" />
      <ul className="flex-1 space-y-3">
        {features.map((feature) => (
          <li className="flex gap-2 text-sm leading-6 text-slate-700 dark:text-slate-200" key={feature}>
            <span className="mt-1 inline-flex shrink-0 items-center justify-center text-[#0B0F17] dark:text-white">
              <FiCheckCircle aria-hidden="true" className="size-3.5" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        className="btn-premium-gradient mt-7 inline-flex min-h-9 items-center justify-center rounded-full px-4 text-xs font-semibold tracking-wide transition duration-300 hover:-translate-y-0.5 active:scale-[0.985] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-600"
        to={toAuthenticated}
      >
        {buttonLabel}
      </Link>
    </article>
  )
}


