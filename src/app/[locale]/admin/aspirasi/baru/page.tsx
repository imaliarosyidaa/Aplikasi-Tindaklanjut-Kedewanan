'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import { FormAspirasi } from '@/components/forms/FormAspirasi'
export default function AspirasiBaruPage(): React.ReactNode {
  const t = useTranslations('Aspirasi')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('tambahAspirasi')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Input data aspirasi baru
        </p>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6">
        <FormAspirasi />
      </div>
    </div>
  )
}
