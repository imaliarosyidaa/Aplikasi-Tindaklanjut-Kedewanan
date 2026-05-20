'use client'
import React from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/utils/cn'
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  onClick?: () => void
  description?: string
}

export const StatCard = ({
  title,
  value,
  icon,
  variant = 'default',
  onClick,
  description,
}: StatCardProps): React.ReactNode => {
  const variantStyles = {
    default: 'text-[var(--color-primary)]',
    primary: 'text-[var(--color-primary)]',
    success: 'text-[var(--color-success)]',
    warning: 'text-[var(--color-warning)]',
    danger: 'text-[var(--color-danger)]',
    info: 'text-[var(--color-info)]',
  }

  const cardContent = (
    <>
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]',
          variantStyles[variant]
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">{title}</p>
        <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
        {description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {description}
          </p>
        )}
      </div>
    </>
  )

  if (onClick) {
    return (
      <Card
        className="flex items-center gap-4 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
        onClick={onClick}
      >
        {cardContent}
      </Card>
    )
  }

  return (
    <Card className="flex items-center gap-4">
      {cardContent}
    </Card>
  )
}
