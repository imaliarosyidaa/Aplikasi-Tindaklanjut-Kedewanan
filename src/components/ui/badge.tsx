'use client'
import React from 'react'

import { cn } from '@/utils/cn'
import type { AspirasiStatus } from '@/types'

interface BadgeProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  status?: AspirasiStatus
  children: string
}

const statusVariants: Record<AspirasiStatus, string> = {
  BELUM_DITINDAKLANJUTI: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20',
  SEDANG_DITINDAKLANJUTI: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
  SUDAH_DITINDAKLANJUTI: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
  TIDAK_BISA_DITINDAKLANJUTI: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
}

export const Badge = ({
  variant = 'default',
  status,
  children,
}: BadgeProps): React.ReactNode => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border'

  const variants: Record<string, string> = {
    default: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)]',
    primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-[var(--color-primary)]/20',
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/20',
    info: 'bg-[var(--color-info)]/10 text-[var(--color-info)] border-[var(--color-info)]/20',
  }

  const variantClass = status ? statusVariants[status] : variants[variant]

  return <span className={cn(base, variantClass)}>{children}</span>
}
