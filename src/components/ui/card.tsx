'use client'
import React from 'react'

import { cn } from '@/utils/cn'
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'stat'
}

export const Card = ({
  className,
  variant = 'default',
  children,
  ...props
}: CardProps): React.ReactNode => {
  const variants = {
    default: 'bg-[var(--color-bg)] border border-[var(--color-border)]',
    stat: 'bg-[var(--color-bg)] border border-[var(--color-border)]',
  }

  return (
    <div
      className={cn(
        'rounded-xl p-6 shadow-sm',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
