'use client'

import React, { use, useState, useEffect } from 'react'
import { useAspirasi } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/routing'
import { MdArrowBack, MdDescription, MdEdit, MdFlag } from 'react-icons/md'
import { Aspirasi } from '@/types'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'

interface AspirasiDetailProps {
  params: Promise<{ id: string }>
}

export default function AspirasiDetailPage({ params }: AspirasiDetailProps): React.ReactNode {
  const { id } = use(params)
  const { data: aspirasi, mutate, isLoading } = useAspirasi(id)

  const statusLabel: Record<string, string> = {
    BELUM_DITINDAKLANJUTI: 'Belum Ditindaklanjuti',
    SEDANG_DITINDAKLANJUTI: 'Sedang Ditindaklanjuti',
    SUDAH_DITINDAKLANJUTI: 'Sudah Ditindaklanjuti',
    TIDAK_BISA_DITINDAKLANJUTI: 'Tidak Bisa Ditindaklanjuti',
  }

  const statusOptions = [
    { value: 'BELUM_DITINDAKLANJUTI', label: 'Belum Ditindaklanjuti' },
    { value: 'SEDANG_DITINDAKLANJUTI', label: 'Sedang Ditindaklanjuti' },
    { value: 'SUDAH_DITINDAKLANJUTI', label: 'Sudah Ditindaklanjuti' },
    { value: 'TIDAK_BISA_DITINDAKLANJUTI', label: 'Tidak Bisa Ditindaklanjuti' },
  ]

  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const rawTrackings = aspirasi?.trackings ?? []
  const latestTracking = rawTrackings.length > 0 ? rawTrackings[rawTrackings.length - 1] : null
  const latestCatatan = latestTracking?.catatan ?? 'Belum ada catatan'

  const currentStatus = latestTracking?.status || aspirasi?.status || ''
  // State local untuk menyimpan status yang terpilih
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  // Cari tracking yang sesuai dengan selectedStatus (cari dari paling baru)
  const activeTracking = selectedStatus
    ? [...rawTrackings].reverse().find((t) => t.status === selectedStatus)
    : latestTracking
  const activeNote = activeTracking?.catatan || ''
  const activeLampiran: string[] = Array.isArray(activeTracking?.lampiran) ? activeTracking.lampiran : []

  // SINKRONISASI STATE: Isi state lokal dengan status terakhir dari data API
  useEffect(() => {
    if (currentStatus) {
      setSelectedStatus(currentStatus)
    }
  }, [currentStatus, activeNote])

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin h-10 w-10 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6 text-blue-500">
      <Link href="/admin/aspirasi">
        <Button variant="ghost" size="sm" className="mb-4">
          <MdArrowBack size={18} className="mr-1" />
          Kembali Ke Daftar Laporan
        </Button>
      </Link>

      <Card className="flex justify-between p-4">
        <div>
          <h1 className="text-2xl mb-2 font-bold text-[var(--color-text)]">Laporan {aspirasi?.id_laporan}</h1>
          <p className="text-[var(--color-text)] text-sm">Dibuat pada {formatDate(aspirasi?.created_at)} WIB</p>
        </div>
        <div>
          <Badge status={aspirasi?.status as any}>
            {statusLabel[aspirasi?.status ?? ''] || aspirasi?.status || '-'}
          </Badge>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* KOLOM 1: Perbandingan 3:3 (row-span-3 & row-span-3) */}
        <div className="flex flex-col gap-5">
          {/* Informasi Pelapor (3 unit) */}
          <Card className="p-5 shadow-sm rounded-xl border border-[var(--color-border)] flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 pb-3 border-b border-[var(--color-border)]">
                Informasi Pelapor
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">NIK</span>
                  <span className="text-[var(--color-text)] font-semibold">{aspirasi?.nik || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Nama</span>
                  <span className="text-[var(--color-text)] font-semibold">{aspirasi?.pelapor_nama || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Email</span>
                  <span className="text-[var(--color-text)] font-medium truncate max-w-[180px]">
                    {aspirasi?.pelapor_email || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Telepon</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.pelapor_telepon || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Alamat</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.lokasi || '-'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Alamat Usulan (3 unit) */}
          <Card className="p-5 shadow-sm rounded-xl border border-[var(--color-border)] flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 pb-3 border-b border-[var(--color-border)]">
                Alamat Usulan
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Kota / Kab</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.kota || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Kecamatan</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.kecamatan || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Kelurahan</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.kelurahan || '-'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* KOLOM 2: Perbandingan 2:4 (row-span-2 & row-span-4) */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Isi Aspirasi (2 unit) */}
          <Card className="p-5 space-y-4 lg:row-span-2 flex flex-col overflow-y-auto">
            <h3 className="text-base font-semibold text-[var(--color-text)] border-b pb-2">Isi Aspirasi Anda</h3>
            <p className="text-[var(--color-text)] text-sm">{aspirasi?.deskripsi}</p>

            <p className="text-sm font-semibold text-[var(--color-text)]">Lampiran</p>
            <div className="grid grid-cols-4 gap-2">
              {Array.isArray(aspirasi?.lampiran)
                ? (() => {
                    const total = aspirasi?.lampiran.length
                    const maxVisible = 4
                    const visible = aspirasi?.lampiran.slice(0, maxVisible)
                    const remaining = total - maxVisible

                    return visible.map((url: unknown, i: number) => {
                      const isLast = i === maxVisible - 1 && remaining > 0
                      const f = typeof url === 'string' ? url : ''
                      const isPdf = f.startsWith('data:application/pdf') || f.toLowerCase().includes('.pdf')

                      return (
                        <div
                          key={i}
                          className="relative aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] bg-gray-50 group cursor-pointer"
                          onClick={() => {
                            if (isLast) return
                            if (f.startsWith('data:')) {
                              fetch(f)
                                .then((r) => r.blob())
                                .then((blob) => window.open(URL.createObjectURL(blob), '_blank'))
                            } else {
                              window.open(f, '_blank')
                            }
                          }}
                        >
                          {isPdf ? (
                            <div className="flex items-center justify-center h-full text-xs text-blue-600 font-medium p-1 text-center">
                              PDF
                            </div>
                          ) : f.startsWith('data:') ? (
                            <img src={f} alt="Lampiran" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-blue-600 underline truncate p-1">
                              File {i + 1}
                            </div>
                          )}
                          {isLast && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="text-white text-lg font-bold">+{remaining} lainnya</span>
                            </div>
                          )}
                        </div>
                      )
                    })
                  })()
                : typeof aspirasi?.lampiran === 'string'
                  ? aspirasi.lampiran
                  : '-'}
            </div>
          </Card>

          {/* Timeline / Riwayat (4 unit) */}
          <Card className="p-5 shadow-sm rounded-xl border lg:row-span-4 flex flex-col overflow-y-auto">
            <h3 className="text-base font-semibold text-[var(--color-text)] pb-4 mb-2 border-b border-[var(--color-border)]">
              Timeline / Riwayat
            </h3>

            {rawTrackings.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] italic py-2">Belum ada riwayat tindak lanjut.</p>
            ) : (
              <div className="relative space-y-6 mb-4">
                {rawTrackings.map((t, index) => (
                  <div key={t.id || index} className="flex gap-6 relative group">
                    <div className="flex flex-col items-center">
                      <span className="absolute top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900 group-first:bg-blue-600" />
                      <div className="w-0.5 -mb-4 mt-4 flex-1 bg-[var(--color-primary)]" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-[var(--color-text)]">
                            {statusLabel[t.status] || t.status?.replace(/_/g, ' ')}
                          </span>
                          {t.created_at && (
                            <span className="text-xs text-[var(--color-text-secondary)]">
                              {formatDate(t.created_at)} WIB
                            </span>
                          )}
                        </div>
                        {t.diverifikasi_oleh_id && (
                          <div className="flex flex-col items-end gap-0.5">
                            <div className="text-xs text-[var(--color-text-secondary)]">
                              <MdFlag size={14} className="inline mr-1" />
                              Diverifikasi oleh
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)]">{t.diverifikasi_oleh_nama}</div>
                          </div>
                        )}
                      </div>
                      {t.catatan && (
                        <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap mt-1">"{t.catatan}"</p>
                      )}
                      {Array.isArray(t.lampiran) && t.lampiran.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {t.lampiran.map((url: string, idx: number) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (typeof url === 'string' && url.startsWith('data:')) {
                                  fetch(url)
                                    .then((r) => r.blob())
                                    .then((blob) => window.open(URL.createObjectURL(blob), '_blank'))
                                } else if (typeof url === 'string') {
                                  window.open(url, '_blank')
                                }
                              }}
                              className="inline-flex items-center gap-2 py-1.5 px-3 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                            >
                              <MdDescription size={16} />
                              Lihat Lampiran {t.lampiran.length > 1 ? `#${idx + 1}` : ''}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* KOLOM 3: Perbandingan 4:2 (row-span-4 & row-span-2) */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Update Tindak Lanjut (4 unit) */}
          <Card className="p-5 space-y-4 lg:row-span-4 flex flex-col justify-between overflow-y-auto">
            <div className="h-fit">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[var(--color-text)] border-b pb-2">Tindak Lanjut</h3>

                {/* BADGE-STYLED STATUS SELECTOR */}
                <div className="space-y-1">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] flex items-center gap-2"
                    >
                      <Badge status={selectedStatus as any}>{statusLabel[selectedStatus] || selectedStatus}</Badge>
                      <span className="ml-auto text-[var(--color-text-secondary)]">▾</span>
                    </button>
                    {showStatusDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                        <div className="absolute z-20 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] shadow-lg p-1 space-y-1">
                          {statusOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setSelectedStatus(opt.value)
                                setShowStatusDropdown(false)
                              }}
                              className="w-full text-left px-1 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                              <Badge status={opt.value as any}>{opt.label}</Badge>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm font-semibold text-[var(--color-text)]">Catatan Tindak Lanjut Terbaru</p>
                <p className="text-[var(--color-text)] text-sm">{latestCatatan || '-'}</p>

                <p className="text-sm font-semibold text-[var(--color-text)]">Bukti Tindak Lanjut Terbaru</p>
                <div className="flex flex-wrap gap-2">
                  {activeLampiran.length > 0 ? (
                    activeLampiran.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (typeof url === 'string' && url.startsWith('data:')) {
                            fetch(url)
                              .then((r) => r.blob())
                              .then((blob) => window.open(URL.createObjectURL(blob), '_blank'))
                          } else if (typeof url === 'string') {
                            window.open(url, '_blank')
                          }
                        }}
                        className="inline-flex items-center gap-2 py-1.5 px-3 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                      >
                        <MdDescription size={16} />
                        Lihat Bukti {activeLampiran.length > 1 ? `#${idx + 1}` : ''}
                      </button>
                    ))
                  ) : (
                    <span className="text-sm text-[var(--color-text-secondary)]">-</span>
                  )}
                </div>
              </div>

              <Button onClick={() => setSelectedAspirasi(aspirasi || null)} className="w-full mt-4">
                <MdEdit size={18} className="mr-1" />
                Update Status
              </Button>
            </div>
          </Card>

          {/* Informasi Tambahan (2 unit) */}
          <Card className="p-5 shadow-sm rounded-xl border border-[var(--color-border)] lg:row-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-4 pb-3 border-b border-[var(--color-border)]">
                Informasi Tambahan
              </h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Kategori Usulan</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.kategori_usulan || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Jenis Usulan</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.jenis_usulan || '-'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-[var(--color-text-secondary)]">Jenis Reses</span>
                  <span className="text-[var(--color-text)] font-medium">{aspirasi?.jenis_reses || '-'}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Modal isOpen={!!selectedAspirasi} onClose={() => setSelectedAspirasi(null)} title="Update Status">
        {selectedAspirasi && (
          <FormUpdateAspirasi
            aspirasi={selectedAspirasi}
            onSuccess={() => {
              setSelectedAspirasi(null)
              mutate()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
