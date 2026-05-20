'use client'
import React, { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useKunjunganList } from '@/hooks/useKunjungan'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import {
  MdLocationOn,
  MdCalendarToday,
  MdAccessTime,
  MdImage,
  MdChevronRight,
} from 'react-icons/md'
import {
  MASTER_WILAYAH,
  type KecamatanData,
} from '@/utils/masterWilayah'
import { dummyKegiatan, dummyKunjungan } from '@/data/dummy'
import type { Kunjungan, Kegiatan } from '@/types'
export default function KunjunganListPage(): React.ReactNode {
  const t = useTranslations('Kunjungan')
  const { data: kunjunganList, isLoading } = useKunjunganList()

  const [selectedKecamatan, setSelectedKecamatan] = useState<string | null>(null)
  const [selectedKelurahan, setSelectedKelurahan] = useState<string | null>(null)

  const activeKecamatan = selectedKecamatan
    ? MASTER_WILAYAH.find((k) => k.nama === selectedKecamatan) ?? null
    : null

  const getKunjunganByKelurahan = (kelurahan: string): Kunjungan[] => {
    return (kunjunganList ?? []).filter(
      (k: Kunjungan) => k.kelurahan === kelurahan
    )
  }

  const getKelurahanVisited = (kecamatan: KecamatanData): number => {
    const visited = new Set<string>()
    kecamatan.kelurahan.forEach((kel) => {
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

  const getKegiatanByKelurahan = (kelurahan: string): Kegiatan[] => {
    const kunjunganIds = dummyKunjungan
      .filter((k) => k.kelurahan === kelurahan)
      .map((k) => k.id)
    return dummyKegiatan.filter((kg) => kunjunganIds.includes(kg.kunjungan_id))
  }

  const getHari = (tanggal: string): string => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const d = new Date(tanggal)
    return days[d.getDay()]
  }

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
        <p className="text-sm text-[var(--color-text-secondary)]">
          Daftar kunjungan yang telah diinput
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-2">
        {MASTER_WILAYAH.map((kec) => {
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
              const kegiatanCount = getKegiatanByKelurahan(kel.nama).length
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
              {getKegiatanByKelurahan(selectedKelurahan).length === 0 ? (
                <Card>
                  <p className="text-center text-[var(--color-text-secondary)] py-4">
                    Belum ada data kegiatan
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {getKegiatanByKelurahan(selectedKelurahan).map((kegiatan: Kegiatan) => (
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
