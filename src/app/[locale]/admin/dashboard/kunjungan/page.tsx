'use client'
import React from 'react'

import { useTranslations } from 'next-intl'
import { useKunjunganList } from '@/hooks/useKunjungan'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdArrowBack,
} from 'react-icons/md'
import { Link } from '@/routing'
import { MASTER_WILAYAH } from '@/utils/masterWilayah'
import type { Kunjungan } from '@/types'
export default function DashboardKunjunganPage(): React.ReactNode {
  const t = useTranslations('Kunjungan')
  const c = useTranslations('Common')
  const { data: kunjunganList, isLoading } = useKunjunganList()

  const dapil8Kecamatan = MASTER_WILAYAH.map((k) => k.nama)

  const kunjunganByKecamatan = dapil8Kecamatan.map((kec) => ({
    kecamatan: kec,
    kunjungan: (kunjunganList ?? []).filter(
      (k: Kunjungan) => k.kecamatan === kec
    ),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard">
        <button className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline">
          <MdArrowBack size={16} />
          {c('back')}
        </button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Kunjungan per Wilayah Dapil 8
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Daftar kunjungan berdasarkan wilayah kecamatan
        </p>
      </div>

      <div className="space-y-6">
        {kunjunganByKecamatan.map(({ kecamatan, kunjungan }) => (
          <div key={kecamatan}>
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">
              {kecamatan}
            </h2>
            {kunjungan.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] ml-4">
                Belum ada kunjungan
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {kunjungan.map((kunjungan: Kunjungan) => (
                  <Card key={kunjungan.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                      <MdCalendarToday size={14} />
                      <span>{kunjungan.tanggal}</span>
                      <MdAccessTime size={14} />
                      <span>{kunjungan.jam}</span>
                    </div>
                    <p className="font-medium text-[var(--color-text)]">
                      {kunjungan.jalan}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">{kunjungan.kelurahan}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <MdLocationOn size={12} />
                      <span>{kunjungan.kota}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
