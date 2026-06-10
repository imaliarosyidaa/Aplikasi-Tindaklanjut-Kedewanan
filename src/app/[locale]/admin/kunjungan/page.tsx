'use client'

import React from 'react'
import useSWR from 'swr'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import { MdLocationCity, MdChevronRight } from 'react-icons/md'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem {
  id: string
  nama: string
}

export default function PilihKotaPage() {
  const t = useTranslations('Kunjungan')
  const { data: kotaList, isLoading } = useSWR<KotaItem[]>('/api/kota', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('daftarKunjungan')}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Pilih kota untuk melihat daftar kegiatan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kotaList?.map((kota) => (
          <Link key={kota.id} href={`/admin/kunjungan/list?kota=${encodeURIComponent(kota.nama)}`}>
            <Card className="flex items-center justify-between p-5 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-3">
                <MdLocationCity size={24} className="text-[var(--color-primary)]" />
                <div>
                  <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {kota.nama}
                  </p>
                </div>
              </div>
              <MdChevronRight size={20} className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-primary)] transition-colors" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
