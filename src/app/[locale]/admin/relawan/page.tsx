'use client'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import { useRelawanList } from '@/hooks/useRelawan'
import { MdGroup, MdAdd, MdPerson, MdPhone } from 'react-icons/md'

const POSISI_LABEL: Record<string, string> = {
  KOORDINATOR_RW: 'Koordinator RW',
  KOORDINATOR_RT: 'Koordinator RT',
  KOORDINATOR_KELURAHAN: 'Koordinator Kelurahan',
  KOORDINATOR_KECAMATAN: 'Koordinator Kecamatan',
  FKDM: 'FKDM',
  LMK: 'LMK',
  TOKOH_MASYARAKAT: 'Tokoh Masyarakat',
  PROFESIONAL: 'Profesional',
}

export default function RelawanPage(): React.ReactNode {
  const { data: relawans, isLoading } = useRelawanList()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Data Relawan
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Kelola data relawan DPRD DKI Jakarta
          </p>
        </div>
        <Link href="/admin/relawan/baru">
          <Button>
            <MdAdd size={18} className="mr-1" />
            Tambah Relawan
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      ) : !relawans || relawans.length === 0 ? (
        <Card className="p-8 text-center">
          <MdGroup size={48} className="mx-auto text-[var(--color-text-secondary)] mb-3" />
          <p className="text-[var(--color-text-secondary)]">Belum ada data relawan</p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">NIK</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No. Telepon</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Posisi</th>
              </tr>
            </thead>
            <tbody>
              {relawans.map((r, i) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">{r.nik}</td>
                  <td className="px-4 py-3">{r.nama}</td>
                  <td className="px-4 py-3">{r.no_telepon}</td>
                  <td className="px-4 py-3">{r.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-4 py-3">{r.kecamatan}</td>
                  <td className="px-4 py-3">{r.kelurahan}</td>
                  <td className="px-4 py-3"><Badge variant="primary">{POSISI_LABEL[r.posisi] || r.posisi}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
