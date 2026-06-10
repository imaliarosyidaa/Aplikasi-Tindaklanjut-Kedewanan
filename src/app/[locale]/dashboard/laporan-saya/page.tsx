'use client'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import { useAspirasiList } from '@/hooks/useAspirasi'
import { useTranslations } from 'next-intl'
import type { Aspirasi } from '@/types'
import { getKecamatanOptions, getKelurahanByKecamatanId } from '@/utils/masterWilayah'
import {
  MdSearch,
  MdArrowBack,
  MdPhone,
  MdPerson,
} from 'react-icons/md'

export default function LaporanSayaPage(): React.ReactNode {
  const s = useTranslations('Sumber')
  const { data: allAspirasi } = useAspirasiList()
  const [kota] = useState('Jakarta Selatan')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<Aspirasi[]>([])
  const [selected, setSelected] = useState<Aspirasi | null>(null)

  const kecamatanOptions = getKecamatanOptions()

  const handleSearch = () => {
    const q = query.toLowerCase().trim()
    const kecamatanNama = kecamatanOptions.find(k => k.value === kecamatanId)?.label ?? ''
    const kelurahanOptions = kecamatanId ? getKelurahanByKecamatanId(kecamatanId) : []
    const kelurahanNama = kelurahanOptions.find(k => k.value === kelurahanId)?.label ?? ''

    const filtered = allAspirasi.filter((a) => {
      if (kecamatanNama && a.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && a.kelurahan !== kelurahanNama) return false
      if (!q) return true
      return (
        a.pelapor_nama.toLowerCase().includes(q) ||
        a.pelapor_telepon.includes(q)
      )
    })
    setResults(filtered)
    setSearched(true)
    setSelected(null)
  }

  const hasFilter = kota || kecamatanId || kelurahanId || query.trim()

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <MdArrowBack size={16} />
        Kembali ke Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Laporan Saya
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Filter dan cari laporan Anda
        </p>
      </div>

      <Card className="p-6 w-full mx-auto bg-purple-50 border-purple-200">
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian Laporan</p>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Input
                id="kota"
                label="Kota"
                value={kota}
                disabled
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kecamatan"
                label="Kecamatan"
                placeholder="Semua Kecamatan"
                options={kecamatanOptions}
                value={kecamatanId}
                onChange={(e) => {
                  setKecamatanId(e.target.value)
                  setKelurahanId('')
                }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kelurahan"
                label="Kelurahan"
                placeholder={kecamatanId ? 'Semua Kelurahan' : 'Pilih Kecamatan dulu'}
                options={kecamatanId ? getKelurahanByKecamatanId(kecamatanId) : []}
                value={kelurahanId}
                onChange={(e) => setKelurahanId(e.target.value)}
                disabled={!kecamatanId}
              />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                id="query"
                label="Nama atau No. Telepon"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Contoh: Siti atau 081234567890"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
            </div>
            <Button onClick={handleSearch} disabled={!hasFilter}>
              <MdSearch size={18} className="mr-1" />
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {searched && (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama Pelapor</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No. Telepon</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Deskripsi</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    Tidak ditemukan aspirasi dengan kata kunci tersebut
                  </td>
                </tr>
              ) : (
                results.map((aspirasi, i) => (
                  <tr
                    key={aspirasi.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 cursor-pointer"
                    onClick={() => setSelected(selected?.id === aspirasi.id ? null : aspirasi)}
                  >
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MdPerson size={14} className="text-[var(--color-text-secondary)]" />
                        {aspirasi.pelapor_nama}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MdPhone size={14} className="text-[var(--color-text-secondary)]" />
                        {aspirasi.pelapor_telepon}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">{aspirasi.deskripsi}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge status={aspirasi.status}>{aspirasi.status.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                      {aspirasi.tanggal_dibuat}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Card className="p-4 space-y-3 max-w-lg mx-auto">
          <div className="flex items-start justify-between">
            <p className="font-medium text-[var(--color-text)]">
              {selected.deskripsi}
            </p>
            <Badge status={selected.status}>
              {selected.status.replace(/_/g, ' ')}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[var(--color-text-secondary)]">Sumber</p>
              <p className="text-[var(--color-text)]">{s(selected.sumber)}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Nama Pelapor</p>
              <p className="text-[var(--color-text)]">{selected.pelapor_nama}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">No. Telepon</p>
              <p className="text-[var(--color-text)]">{selected.pelapor_telepon}</p>
            </div>
            <div>
              <p className="text-[var(--color-text-secondary)]">Tanggal</p>
              <p className="text-[var(--color-text)]">{selected.tanggal_dibuat}</p>
            </div>
          </div>
          {selected.catatan_tindak_lanjut && (
            <div className="rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm">
              <p className="text-[var(--color-text-secondary)] font-medium mb-1">
                Catatan Tindak Lanjut:
              </p>
              <p className="text-[var(--color-text)]">
                {selected.catatan_tindak_lanjut}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
