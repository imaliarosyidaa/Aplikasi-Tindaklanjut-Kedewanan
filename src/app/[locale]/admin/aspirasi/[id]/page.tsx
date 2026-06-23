'use client'
import React from 'react'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { useAspirasi } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/routing'
import { MdArrowBack, MdPerson } from 'react-icons/md'
interface AspirasiDetailProps {
  params: Promise<{ id: string }>
}

export default function AspirasiDetailPage({
  params,
}: AspirasiDetailProps): React.ReactNode {
  const { id } = use(params)
  const t = useTranslations('Aspirasi')
  const s = useTranslations('Sumber')
  const { data: aspirasi, isLoading } = useAspirasi(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  if (!aspirasi) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">
          Aspirasi tidak ditemukan
        </p>
      </div>
    )
  }

  const detailFields = [
    { label: t('deskripsi'), value: aspirasi.deskripsi },
    { label: 'Kategori Usulan', value: aspirasi.kategori_usulan },
    { label: 'Jenis Usulan', value: aspirasi.jenis_usulan },
    { label: 'Jenis Reses', value: aspirasi.jenis_reses },
    { label: 'Tindak Lanjut', value: aspirasi.tindak_lanjut },
    { label: t('sumber'), value: s(aspirasi.sumber) },
    { label: 'Tanggal Dibuat', value: aspirasi.tanggal_dibuat },
  ]

  return (
    <div className="space-y-6">
      <Link href="/admin/aspirasi">
        <Button variant="ghost" size="sm">
          <MdArrowBack size={18} className="mr-1" />
          Kembali
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('detailAspirasi')}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center">
              <MdPerson size={40} className="text-[var(--color-text-secondary)]" />
            </div>
            <div className="space-y-2 w-full">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {t('pelapor')}
                </p>
                <p className="font-medium text-[var(--color-text)]">
                  {aspirasi.pelapor_nama}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Email
                </p>
                <p className="font-medium text-[var(--color-text)]">
                  {aspirasi.pelapor_email || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Telepon
                </p>
                <p className="font-medium text-[var(--color-text)]">
                  {aspirasi.pelapor_telepon || '-'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Status
                </p>
                <Badge status={aspirasi.status}>{t(aspirasi.status)}</Badge>
              </div>
            </div>

            {detailFields.map((field) => (
              <div key={field.label}>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {field.label}
                </p>
                <p className="text-[var(--color-text)] whitespace-pre-wrap">
                  {field.value}
                </p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
