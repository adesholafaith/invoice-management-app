import { cn } from '../../utils/cn'

const logoSources = {
  black: '/brand-assets/billing-logo-black-large-paper-192.png',
  white: '/brand-assets/billing-logo-white-transparent-large-paper-192.png',
}

const textColors = {
  black: 'text-[var(--ink)]',
  white: 'text-white',
}

export function BrandLogo({ className, iconClassName, textClassName, variant = 'black' }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Billing">
      <span className={className}>
        <img
          alt=""
          aria-hidden="true"
          className={cn('size-10 object-contain', iconClassName)}
          height="40"
          src={logoSources[variant]}
          width="40"
        />
      </span>
      <span className={cn('font-sans text-[15px] font-bold leading-none', textColors[variant], textClassName)}>
        Billing
      </span>
    </span>
  )
}
