'use client'
import React from 'react'

import { use } from 'react'
import { useAspirasi } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/routing'
import { MdArrowBack, MdPerson, MdDescription } from 'react-icons/md'
interface AspirasiDetailProps {
  params: Promise<{ id: string }>
}

export default function AspirasiDetailPage({
  params,
}: AspirasiDetailProps): React.ReactNode {
  const { id } = use(params)
  const sumberLabel: Record<string, string> = {
    LEMBAR_ASPIRASI_RESES: 'Lembar Aspirasi Reses',
    LEMBAR_ASPIRASI_SOSPERDA: 'Lembar Aspirasi Sosperda',
    ASPIRASI_PROPOSAL_LANGSUNG: 'Aspirasi Proposal Langsung',
    KOORDINASI_DINAS_TERKAIT: 'Koordinasi Dinas Terkait',
    USULAN_MUSRENBANG_DEWAN: 'Usulan Musrenbang Dewan',
    CALL_CENTER: 'Call Center',
  }
  const statusLabel: Record<string, string> = {
    BELUM_DITINDAKLANJUTI: 'Belum Ditindaklanjuti',
    SEDANG_DITINDAKLANJUTI: 'Sedang Ditindaklanjuti',
    SUDAH_DITINDAKLANJUTI: 'Sudah Ditindaklanjuti',
    TIDAK_BISA_DITINDAKLANJUTI: 'Tidak Bisa Ditindaklanjuti',
  }
  const { data: aspirasi } = useAspirasi(id)
  const formatTanggalJam = (dateString: string) => {
  const date = new Date(dateString)

  return `${date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}, Jam ${date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })} WIB`
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
    { label: 'Deskripsi', value: aspirasi.deskripsi },
    { label: 'Kategori Usulan', value: aspirasi.kategori_usulan },
    { label: 'Jenis Usulan', value: aspirasi.jenis_usulan },
    { label: 'Jenis Reses', value: aspirasi.jenis_reses },
    { label: 'Tindak Lanjut', value: aspirasi.tindak_lanjut },
    { label: 'Sumber Aspirasi', value: sumberLabel[aspirasi.sumber] || aspirasi.sumber },
    { label: 'Tanggal Dibuat', value: formatTanggalJam(aspirasi.tanggal_dibuat) },
  ]

  const rawTrackings = aspirasi.trackings ?? []

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
          Detail Aspirasi
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
                  Pelapor
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
                <Badge status={aspirasi.status}>{statusLabel[aspirasi.status] || aspirasi.status}</Badge>
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

            {rawTrackings.some(t => t.lampiran && t.lampiran.length > 0) && (
              <Card className="space-y-4 p-5">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Bukti Tindak Lanjut</h2>
                <div className="flex flex-col gap-3">
                  {rawTrackings.filter(t => t.lampiran && t.lampiran.length > 0).map((t) =>
                    t.lampiran.map((url: string, idx: number) => (
                      <button
                        key={`${t.id}-${idx}`}
                        type="button"
                        onClick={() => {
                          fetch(url).then(r => r.blob()).then(blob => {
                            window.open(URL.createObjectURL(blob), '_blank')
                          })
                        }}
                        className="inline-flex items-center gap-2 py-2 px-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <MdDescription size={18} />
                        Klik untuk Melihat Detail
                      </button>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    )
  }
