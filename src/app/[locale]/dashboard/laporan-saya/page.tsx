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
import {
  MdSearch,
  MdArrowBack,
  MdPhone,
  MdPerson,
  MdLocationOn,
  MdDescription,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
  MdSource,
} from 'react-icons/md'
import useSWR from 'swr'
import { getKelurahanByKecamatanId } from '@/utils/masterWilayah'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }

function TrackingTicket({ aspirasi }: { aspirasi: Aspirasi }) {
  const isRejected = aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
  const isProcessing = aspirasi.status === 'SEDANG_DITINDAKLANJUTI'
  const isCompleted = aspirasi.status === 'SUDAH_DITINDAKLANJUTI'
  const showStep2 = aspirasi.status !== 'BELUM_DITINDAKLANJUTI'

  const steps = [
    { label: 'Laporan Anda Diterima', icon: <MdHourglassEmpty size={20} /> },
    {
      label: isRejected ? 'Tidak Dapat Ditindaklanjuti' : isCompleted ? 'Laporan Anda Sudah Diproses' : isProcessing ? 'Laporan Anda Sedang Diproses' : 'Menunggu Diproses',
      icon: isRejected ? <MdCancel size={20} /> : <MdSearch size={20} />,
    },
  ]
  if (isCompleted) {
    steps.push({ label: 'Laporan Anda Sudah Ditindak Lanjuti', icon: <MdCheckCircle size={20} /> })
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">ID Laporan</p>
          <p className="font-mono font-bold text-[var(--color-text)]">{aspirasi.id_laporan}</p>
        </div>
        <Badge status={aspirasi.status}>
          {aspirasi.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <MdPerson size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text)]">{aspirasi.pelapor_nama}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdPhone size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text)]">{aspirasi.pelapor_telepon}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdLocationOn size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Kota:</span>
          <span className="text-[var(--color-text)]">{aspirasi.kota || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdLocationOn size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Kec.:</span>
          <span className="text-[var(--color-text)]">{aspirasi.kecamatan || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdLocationOn size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Kel.:</span>
          <span className="text-[var(--color-text)]">{aspirasi.kelurahan || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdSource size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Sumber:</span>
          <span className="text-[var(--color-text)]">{aspirasi.sumber.replace(/_/g, ' ')}</span>
        </div>
        {aspirasi.lokasi && (
          <div className="flex items-center gap-2 col-span-2">
            <MdLocationOn size={16} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="text-[var(--color-text-secondary)]">Lokasi:</span>
            <span className="text-[var(--color-text)]">{aspirasi.lokasi}</span>
          </div>
        )}
        <div className="flex items-start gap-2 col-span-2">
          <MdDescription size={16} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
          <span className="text-[var(--color-text)]">{aspirasi.deskripsi}</span>
        </div>
      </div>

      <div className="relative pt-2">
        {steps.map((step, i) => {
          const active = i === 0 || showStep2
          const isLast = i === steps.length - 1

          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  active
                    ? isRejected && isLast
                      ? 'bg-red-100 text-red-600'
                      : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
                }`}>
                  {step.icon}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-6 transition-colors ${
                    showStep2 && !isRejected
                      ? 'bg-[var(--color-primary)]'
                      : isRejected
                      ? 'bg-red-200'
                      : 'bg-[var(--color-border)]'
                  }`} />
                )}
              </div>
              <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                <p className={`text-sm font-medium ${
                  active
                    ? isRejected && isLast
                      ? 'text-red-600'
                      : 'text-[var(--color-text)]'
                    : 'text-[var(--color-text-secondary)]'
                }`}>
                  {step.label}
                </p>
                {isLast && aspirasi.bukti_tindak_lanjut && aspirasi.bukti_tindak_lanjut.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aspirasi.bukti_tindak_lanjut.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Bukti ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-[var(--color-border)]"
                      />
                    ))}
                  </div>
                )}
                {isLast && aspirasi.catatan_tindak_lanjut && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">
                    "{aspirasi.catatan_tindak_lanjut}"
                  </p>
                )}
                {active && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                    {new Date(
                      i === 0 ? aspirasi.tanggal_dibuat : aspirasi.updated_at
                    ).toLocaleDateString('id-ID', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

export default function LaporanSayaPage(): React.ReactNode {
  const s = useTranslations('Sumber')
  const { data: allAspirasi } = useAspirasiList()
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')
  const [queryId, setQueryId] = useState('')
  const [searched, setSearched] = useState(false)
  const [results, setResults] = useState<Aspirasi[]>([])

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null,
    fetcher
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher
  )

  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const handleSearch = () => {
    const q = query.toLowerCase().trim()
    const qId = queryId.trim().toUpperCase()
    const kecamatanNama = kecamatanOptions.find(k => k.value === kecamatanId)?.label ?? ''
    const kelurahanOpts = kecamatanId ? getKelurahanByKecamatanId(kecamatanId) : []
    const kelurahanNama = kelurahanOpts.find(k => k.value === kelurahanId)?.label ?? ''

    const filtered = (allAspirasi ?? []).filter((a) => {
      if (kecamatanNama && a.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && a.kelurahan !== kelurahanNama) return false
      if (qId && (a.id_laporan ?? '').toUpperCase() !== qId) return false
      if (!q) return true
      return (
        a.pelapor_nama.toLowerCase().includes(q) ||
        a.pelapor_telepon.includes(q)
      )
    })
    setResults(filtered)
    setSearched(true)
  }

  const hasFilter = kotaId || kecamatanId || kelurahanId || query.trim() || queryId.trim()

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
              <Select
                id="kota"
                label="Kota"
                placeholder="Semua Kota"
                options={kotaOptions}
                value={kotaId}
                onChange={(e) => { setKotaId(e.target.value); setKecamatanId(''); setKelurahanId('') }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kecamatan"
                label="Kecamatan"
                placeholder="Semua Kecamatan"
                options={kecamatanOptions}
                value={kecamatanId}
                onChange={(e) => { setKecamatanId(e.target.value); setKelurahanId('') }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kelurahan"
                label="Kelurahan"
                placeholder="Semua Kelurahan"
                options={kelurahanOptions}
                value={kelurahanId}
                onChange={(e) => setKelurahanId(e.target.value)}
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
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                id="queryId"
                label="ID Laporan"
                value={queryId}
                onChange={(e) => setQueryId(e.target.value)}
                placeholder="Contoh: LAP-A7B3K9X2P1"
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
        <div className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--color-text-secondary)] py-8">
                Tidak ditemukan aspirasi dengan kata kunci tersebut
              </p>
            </Card>
          ) : (
            results.map((aspirasi) => (
              <TrackingTicket key={aspirasi.id} aspirasi={aspirasi} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
