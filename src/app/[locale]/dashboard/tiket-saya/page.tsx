'use client'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import { dummyAspirasi } from '@/data/dummy'
import { useTranslations } from 'next-intl'
import type { Aspirasi } from '@/types'
import {
  MdSearch,
  MdArrowBack,
  MdPhone,
} from 'react-icons/md'

export default function TiketSayaPage(): React.ReactNode {
  const s = useTranslations('Sumber')
  const [telepon, setTelepon] = useState('')
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<Aspirasi[]>([])

  const handleSearch = () => {
    const filtered = dummyAspirasi.filter(
      (a) => a.pelapor_telepon === telepon
    )
    setResults(filtered)
    setSearched(true)
  }

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
          Masukkan no. telepon Anda untuk melihat progres aspirasi
        </p>
      </div>

      <Card className="p-6 max-w-md">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              id="telepon"
              label="No. Telepon"
              type="tel"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
              placeholder="Contoh: 081234567890"
              required
            />
          </div>
          <Button onClick={handleSearch} disabled={!telepon}>
            <MdSearch size={18} className="mr-1" />
            Cari
          </Button>
        </div>
      </Card>

      {searched && (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Sumber</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Deskripsi</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Pelapor</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    Tidak ditemukan aspirasi dengan no. telepon tersebut
                  </td>
                </tr>
              ) : (
                results.map((aspirasi, i) => (
                  <tr
                    key={aspirasi.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                  >
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">{i + 1}</td>
                    <td className="px-4 py-3">{s(aspirasi.sumber)}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{aspirasi.deskripsi}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <MdPhone size={14} className="text-[var(--color-text-secondary)]" />
                        {aspirasi.pelapor_nama}
                      </div>
                    </td>
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

      {searched && results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Detail Aspirasi
          </h2>
          {results.map((aspirasi) => (
            <Card key={aspirasi.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <p className="font-medium text-[var(--color-text)]">
                  {aspirasi.deskripsi}
                </p>
                <Badge status={aspirasi.status}>
                  {aspirasi.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[var(--color-text-secondary)]">Sumber</p>
                  <p className="text-[var(--color-text)]">{s(aspirasi.sumber)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">Telepon</p>
                  <p className="text-[var(--color-text)]">{aspirasi.pelapor_telepon}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">Nama</p>
                  <p className="text-[var(--color-text)]">{aspirasi.pelapor_nama}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-secondary)]">Tanggal</p>
                  <p className="text-[var(--color-text)]">{aspirasi.tanggal_dibuat}</p>
                </div>
              </div>
              {aspirasi.catatan_tindak_lanjut && (
                <div className="rounded-lg bg-[var(--color-bg-secondary)] p-3 text-sm">
                  <p className="text-[var(--color-text-secondary)] font-medium mb-1">
                    Catatan Tindak Lanjut:
                  </p>
                  <p className="text-[var(--color-text)]">
                    {aspirasi.catatan_tindak_lanjut}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
