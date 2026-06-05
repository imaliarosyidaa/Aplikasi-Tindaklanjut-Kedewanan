'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import { FormKunjungan } from '@/components/forms/FormKunjungan'
export default function KunjunganBaruPage(): React.ReactNode {
  const t = useTranslations('Kunjungan')

  return (
    <div className="w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('inputKunjungan')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Input Kegiatan Kedewanan DPRD DKI Jakarta
        </p>
      </div>

      <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
        <FormKunjungan />
      </div>
    </div>
  )
}
