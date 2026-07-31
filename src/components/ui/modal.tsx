'use client'

import React, { useEffect } from 'react'
import { cn } from '@/utils/cn'
import { MdClose } from 'react-icons/md'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}: ModalProps): React.ReactNode | null => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative z-10 w-full max-w-3xl rounded-xl bg-[var(--color-bg)] p-6 shadow-xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <MdClose size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}