'use client'
import React from 'react'
import useSWR from 'swr'

import { useTranslations } from 'next-intl'

import { Card } from '@/components/ui/card'
import { Link } from '@/routing'
import { MdVisibility } from 'react-icons/md'
import type { Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function KunjunganListPage() {
  const t = useTranslations('Kunjungan')
  const { data: kegiatanList, isLoading } = useSWR<Kegiatan[]>('/api/kegiatan', fetcher)

  if (isLoading) {
    return <p className="text-[var(--color-text-secondary)]">Memuat...</p>
  }

  const formatTanggal = (tanggal: string): string => {
    if (!tanggal) return ''
    const d = new Date(tanggal)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const data = kegiatanList ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('daftarKunjungan')}</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Daftar kegiatan yang telah diinput</p>
      </div>

      {data.length === 0 ? (
        <Card>
          <p className="text-center text-[var(--color-text-secondary)] py-8">Belum ada data kegiatan</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama Kegiatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Lokasi</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kota</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                >
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{item.nama_kegiatan || item.isi}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {formatTanggal(item.tanggal)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.lokasi}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kota}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kecamatan}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kelurahan}</td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/admin/kunjungan/kegiatan/${item.id}`}
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline"
                    >
                      <MdVisibility size={16} />
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
