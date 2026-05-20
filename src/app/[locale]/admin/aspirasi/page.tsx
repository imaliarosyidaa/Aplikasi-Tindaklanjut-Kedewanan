'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useAspirasiList } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'
import { Link } from '@/routing'
import { MdAdd, MdVisibility } from 'react-icons/md'
import type { Aspirasi } from '@/types'
export default function AspirasiPage(): React.ReactNode {
  const t = useTranslations('Aspirasi')
  const s = useTranslations('Sumber')
  const { data: aspirasiList, isLoading, mutate } = useAspirasiList()
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t('title')}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Lacak status tindak lanjut aspirasi
          </p>
        </div>
        <Link href="/admin/aspirasi/baru">
          <Button>
            <MdAdd size={18} className="mr-1" />
            {t('tambahAspirasi')}
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('sumber')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('deskripsi')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('pelapor')}
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                {t('title')}
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {aspirasiList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                >
                  Belum ada data aspirasi
                </td>
              </tr>
            ) : (
              aspirasiList.map((aspirasi: Aspirasi) => (
                <tr
                  key={aspirasi.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                >
                  <td className="px-4 py-3">{s(aspirasi.sumber)}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {aspirasi.deskripsi}
                  </td>
                  <td className="px-4 py-3">{aspirasi.pelapor_nama}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge status={aspirasi.status}>
                      {t(aspirasi.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/aspirasi/${aspirasi.id}`}>
                        <Button variant="ghost" size="sm">
                          <MdVisibility size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAspirasi(aspirasi)}
                      >
                        {t('updateStatus')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={!!selectedAspirasi}
        onClose={() => setSelectedAspirasi(null)}
        title={t('updateStatus')}
      >
        {selectedAspirasi && (
          <FormUpdateAspirasi
            aspirasi={selectedAspirasi}
            onSuccess={() => {
              setSelectedAspirasi(null)
              mutate()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
