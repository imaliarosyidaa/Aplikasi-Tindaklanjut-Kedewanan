'use client'
import React, { useEffect, useRef, useState } from 'react'
import { MdArrowDropDown, MdCheck, MdSearch } from 'react-icons/md'

import { cn } from '@/utils/cn'

interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps {
  id?: string
  label?: string
  options: SearchableSelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const SearchableSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled,
}: SearchableSelectProps): React.ReactNode => {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) searchInputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const selected = options.find((opt) => opt.value === value)
  const q = searchTerm.trim().toLowerCase()
  const visibleOptions = q
    ? options.filter((opt) => opt.label.toLowerCase().includes(q))
    : options

  return (
    <div ref={containerRef} className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)]">
          {label}
        </label>
      )}

      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent',
          disabled && 'cursor-not-allowed opacity-50',
          className
        )}
      >
        <span
          className={cn(
            'truncate',
            !selected && 'text-[var(--color-text-secondary)]'
          )}
        >
          {selected ? selected.label : placeholder || 'Pilih...'}
        </span>
        <MdArrowDropDown
          size={20}
          className={cn(
            'shrink-0 text-[var(--color-text-secondary)] transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="relative z-20">
          <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg">
            <div className="flex items-center gap-1 border-b border-[var(--color-border)] p-2">
              <MdSearch size={16} className="shrink-0 text-[var(--color-text-secondary)]" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari..."
                className="w-full rounded-md border-0 bg-transparent px-1 py-1 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-0"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto p-1">
              {visibleOptions.length === 0 ? (
                <li className="px-3 py-2 text-sm text-[var(--color-text-secondary)]">
                  Tidak ada hasil
                </li>
              ) : (
                visibleOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setOpen(false)
                        setSearchTerm('')
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm hover:bg-[var(--color-bg-secondary)]',
                        opt.value === value && 'text-[var(--color-primary)]'
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.value === value && <MdCheck size={16} className="shrink-0" />}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
