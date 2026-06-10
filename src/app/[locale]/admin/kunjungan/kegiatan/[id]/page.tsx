'use client'
import React from 'react'

import { use } from 'react'
import { useTranslations } from 'next-intl'
import { useKegiatan } from '@/hooks/useKegiatan'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import {
  MdArrowBack,
  MdCalendarToday,
  MdLocationOn,
  MdImage,
  MdMap,
  MdPeople,
  MdNotes,
} from 'react-icons/md'

interface DetailKegiatanProps {
  params: Promise<{ id: string }>
}

export default function DetailKegiatanPage({
  params,
}: DetailKegiatanProps): React.ReactNode {
  const { id } = use(params)
  const t = useTranslations('Kunjungan')
  const { data: kegiatan, isLoading } = useKegiatan(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  if (!kegiatan) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Kegiatan tidak ditemukan</p>
      </div>
    )
  }

  const getHari = (tanggal: string): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const d = new Date(tanggal)
    return days[d.getDay()]
  }

  const fields = [
    { label: 'ID', value: kegiatan.id },
    { label: 'Tanggal', value: `${getHari(kegiatan.tanggal)}, ${kegiatan.tanggal}` },
    { label: 'Jenis Kegiatan', value: kegiatan.jenis_kegiatan },
    { label: 'Nama Kegiatan', value: kegiatan.nama_kegiatan },
    { label: 'Lokasi', value: kegiatan.lokasi },
    {
      label: 'Link GMaps',
      value: kegiatan.link_gmaps,
      isLink: true,
    },
    { label: 'Kecamatan', value: kegiatan.kecamatan ?? '-' },
    { label: 'Kelurahan', value: kegiatan.kelurahan ?? '-' },
    { label: 'RT', value: kegiatan.rt },
    { label: 'RW', value: kegiatan.rw },
    { label: 'Jumlah Peserta', value: String(kegiatan.jumlah_peserta) },
    { label: 'Catatan', value: kegiatan.catatan },
  ]

  return (
    <div className="space-y-6">
      <Link href="/admin/kunjungan/list">
        <Button variant="ghost" size="sm">
          <MdArrowBack size={18} className="mr-1" />
          Kembali ke Daftar Kunjungan
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Detail Kegiatan
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)]">Kegiatan</p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {kegiatan.nama_kegiatan}
                </p>
              </div>
              <Badge variant="primary">{kegiatan.jenis_kegiatan}</Badge>
            </div>

            {fields.map((field) => (
              <div key={field.label}>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {field.label}
                </p>
                {field.isLink ? (
                  <a
                    href={field.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline flex items-center gap-1"
                  >
                    <MdMap size={14} />
                    {field.value}
                  </a>
                ) : (
                  <p className="text-[var(--color-text)] whitespace-pre-wrap">
                    {field.value}
                  </p>
                )}
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="space-y-4">
            <p className="font-medium text-[var(--color-text)]">Informasi Kegiatan</p>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <MdCalendarToday size={16} />
              <span>{getHari(kegiatan.tanggal)}, {kegiatan.tanggal}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <MdLocationOn size={16} />
              <span>{kegiatan.lokasi}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <MdPeople size={16} />
              <span>{kegiatan.jumlah_peserta} peserta</span>
            </div>
            {kegiatan.foto && (
              <div>
                <div className="flex items-center gap-1 text-xs text-[var(--color-primary)] mb-2">
                  <MdImage size={14} />
                  <span>{kegiatan.foto}</span>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
              <MdNotes size={16} className="mt-0.5" />
              <span>{kegiatan.catatan}</span>
            </div>
          </Card>

          <a
            href={kegiatan.link_gmaps}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="w-full">
              <MdMap size={16} className="mr-1" />
              Buka Google Maps
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
