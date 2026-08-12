'use client'

import React from 'react'
import { cn } from '@/utils/cn'

export interface RadioOption {
  label: string
  value: string | number
  disabled?: boolean
}

export interface RadioButtonProps {
  label?: string
  name: string
  options: RadioOption[]
  value?: string | number
  onChange?: (value: string | number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
  error?: string
}

export const RadioButton = ({
  label,
  name,
  options,
  value,
  onChange,
  size = 'md',
  className,
  error,
}: RadioButtonProps): React.ReactNode => {
  // Ukuran lingkaran radio button
  const radioSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  // Ukuran teks label
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Label Group */}
      {label && <label className="text-sm font-medium text-[var(--color-text)]">{label}</label>}

      {/* List Radio Item Menyusun Ke Bawah (flex-col) */}
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isChecked = value === option.value
          const inputId = `radio-${name}-${option.value}`

          return (
            <div
              key={index}
              className="text-[var(--color-primary)] font-semibold h-8 px-3 text-xs inline-flex cursor-pointer items-center justify-center rounded-lg font-medium transition-all select-none border focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:ring-offset-2"
            >
              <label
                id={`label-${index}`}
                key={option.value}
                htmlFor={inputId}
                className={cn(
                  'inline-flex items-center gap-2.5 cursor-pointer select-none text-[var(--color-text)]',
                  option.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  disabled={option.disabled}
                  onChange={() => onChange?.(option.value)}
                  className={cn('cursor-pointer accent-[var(--color-primary)] transition-all', radioSizes[size])}
                />
                <span className={cn('font-normal', textSizes[size])}>{option.label}</span>
              </label>
            </div>
          )
        })}
      </div>

      {/* Pesan Error */}
      {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  )
}
