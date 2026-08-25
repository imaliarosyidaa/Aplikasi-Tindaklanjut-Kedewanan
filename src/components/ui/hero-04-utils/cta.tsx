'use client'

import { Link } from '@/routing'
import { cn } from '@/lib/utils'

export interface CtaProps {
  ctaEnabled?: boolean
  text?: string
  link?: string
  variant?: 'default' | 'outline' | 'link'
  size?: 'default' | 'sm' | 'lg'
}

const variantClasses = {
  default:
    'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  outline:
    'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]',
  link: 'text-[var(--color-text)] underline underline-offset-4 hover:text-[var(--color-primary)]',
}

const sizeClasses = {
  default: 'h-10 px-5 py-2 text-sm',
  sm: 'h-9 px-3 text-sm',
  lg: 'h-12 px-8 text-base',
}

export function Cta({ cta }: { cta: CtaProps }) {
  if (!cta.ctaEnabled || !cta.text) return null

  const variant = cta.variant ?? 'default'
  const size = cta.size ?? 'default'
  const href = cta.link ?? '#'

  const classes = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:pointer-events-none disabled:opacity-50',
    variantClasses[variant],
    sizeClasses[size],
  )

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={classes}>
        {cta.text}
      </Link>
    )
  }

  return (
    <a href={href} className={classes}>
      {cta.text}
    </a>
  )
}
