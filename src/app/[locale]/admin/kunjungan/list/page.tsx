'use client'
import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useSWR from 'swr'

import { useTranslations } from 'next-intl'
import { useKunjunganList } from '@/hooks/useKunjungan'
import { useKegiatanByKelurahan } from '@/hooks/useKegiatan'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import {
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdImage,
  MdChevronRight,
  MdArrowBack,
} from 'react-icons/md'
import type { Kunjungan, Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KecamatanItem {
  id: string
  nama: string
  kelurahan: { id: string; nama: string }[]
}

export default function KunjunganListPage() {
  const t = useTranslations('Kunjungan')
  const searchParams = useSearchParams()
  const kota = searchParams.get('kota')

  const { data: kunjunganList, isLoading: kunjunganLoading } = useKunjunganList()
  const { data: kecamatanData } = useSWR<KecamatanItem[]>(
    kota ? `/api/kecamatan?kota=${encodeURIComponent(kota)}` : null,
    fetcher
  )

  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null)
  const [selectedKelurahan, setSelectedKelurahan] = useState<string | null>(null)
  const { data: kegiatanList } = useKegiatanByKelurahan(selectedKelurahan)

  const kecamatanList = kecamatanData ?? []

  const activeKecamatan = selectedKecamatan
    ? kecamatanList.find((k) => k.nama === selectedKecamatan) ?? null
    : null

  const getKunjunganByKelurahan = (kelurahan: string): Kunjungan[] => {
    return (kunjunganList ?? []).filter(
      (k: Kunjungan) => k.kelurahan === kelurahan
    )
  }

  const getKelurahanVisited = (kec: KecamatanItem): number => {
    const visited = new Set<string>()
    kec.kelurahan.forEach((kel) => {
      if (getKunjunganByKelurahan(kel.nama).length > 0) {
        visited.add(kel.nama)
      }
    })
    return visited.size
  }

  const handleKecamatanTab = (nama: string) => {
    if (selectedKecamatan === nama) {
      setSelectedKecamatan(null)
      setSelectedKelurahan(null)
    } else {
      setSelectedKecamatan(nama)
      setSelectedKelurahan(null)
    }
  }

  const handleKelurahanClick = (kelurahan: string) => {
    if (selectedKelurahan === kelurahan) {
      setSelectedKelurahan(null)
    } else {
      setSelectedKelurahan(kelurahan)
    }
  }

  const getHari = (tanggal: string): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const d = new Date(tanggal)
    return days[d.getDay()]
  }

  if (!kota) {
    return (
      <div className="flex items-center justify-center h-64">
        <Link href="/admin/kunjungan" className="text-[var(--color-primary)] hover:underline">
          Pilih kota terlebih dahulu
        </Link>
      </div>
    )
  }

  if (kunjunganLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

  const displayedKegiatan = kegiatanList ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/kunjungan"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
        >
          <MdArrowBack size={16} />
          Ganti Kota
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t('daftarKunjungan')} - {kota}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Daftar kunjungan yang telah diinput
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-2">
        {kecamatanList.map((kec) => {
          const visited = getKelurahanVisited(kec)
          const isActive = selectedKecamatan === kec.nama
          return (
            <button
              key={kec.id}
              onClick={() => handleKecamatanTab(kec.nama)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              {kec.nama}
              <span className="block text-xs font-normal mt-0.5">
                {visited}/{kec.kelurahan.length} Kelurahan sudah dikunjungi
              </span>
            </button>
          )
        })}
      </div>

      {selectedKecamatan && activeKecamatan && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {activeKecamatan.kelurahan.map((kel) => {
              const visits = getKunjunganByKelurahan(kel.nama).length
              const isKelSelected = selectedKelurahan === kel.nama
              return (
                <button
                  key={kel.id}
                  onClick={() => handleKelurahanClick(kel.nama)}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    isKelSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)] hover:bg-[var(--color-bg-secondary)]'
                  }`}
                >
                  <p className="text-sm font-medium text-[var(--color-text)]">
                    {kel.nama}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {visits} kunjungan
                  </p>
                </button>
              )
            })}
          </div>

          {selectedKelurahan && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[var(--color-text)]">
                Kegiatan di {selectedKelurahan}
              </h3>
              {displayedKegiatan.length === 0 ? (
                <Card>
                  <p className="text-center text-[var(--color-text-secondary)] py-4">
                    Belum ada data kegiatan
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {displayedKegiatan.map((kegiatan: Kegiatan) => (
                    <Link
                      key={kegiatan.id}
                      href={`/admin/kunjungan/kegiatan/${kegiatan.id}`}
                    >
                      <Card className="space-y-3 hover:border-[var(--color-primary)] transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-[var(--color-text)]">
                            {kegiatan.isi}
                          </p>
                          <MdChevronRight
                            size={20}
                            className="text-[var(--color-text-secondary)] shrink-0 mt-0.5"
                          />
                        </div>
                        <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                          <div className="flex items-center gap-2">
                            <MdCalendarToday size={14} />
                            <span>{getHari(kegiatan.tanggal)}, {kegiatan.tanggal}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MdLocationOn size={14} />
                            <span>{kegiatan.lokasi}</span>
                          </div>
                        </div>
                        {kegiatan.foto && (
                          <div className="flex items-center gap-1 text-xs text-[var(--color-primary)]">
                            <MdImage size={14} />
                            <span>{kegiatan.foto}</span>
                          </div>
                        )}
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedKecamatan && (
        kunjunganList.length === 0 ? (
          <Card>
            <p className="text-center text-[var(--color-text-secondary)] py-8">
              Pilih tab wilayah kecamatan untuk melihat kegiatan
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--color-text)]">
              Semua Kunjungan Terbaru
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {kunjunganList.map((kunjungan: Kunjungan) => (
                <Card key={kunjungan.id} className="space-y-3">
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
                    <Badge variant="primary">{kunjungan.kecamatan}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
