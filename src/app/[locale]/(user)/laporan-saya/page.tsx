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
  const rawTrackings = aspirasi.trackings ?? []
  const trackings = Object.values(
    rawTrackings.reduce((acc, t) => {
      if (!acc[t.status] || new Date(t.created_at) > new Date(acc[t.status].created_at)) {
        acc[t.status] = t
      }
      return acc
    }, {} as Record<string, (typeof rawTrackings)[number]>)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  const statusLabelMap: Record<string, string> = {
    BELUM_DITINDAKLANJUTI: 'Laporan Anda Diterima',
    SEDANG_DITINDAKLANJUTI: 'Laporan Anda Sedang Diproses',
    SUDAH_DITINDAKLANJUTI: 'Laporan Anda Sudah Ditindak Lanjuti',
    TIDAK_BISA_DITINDAKLANJUTI: 'Tidak Dapat Ditindaklanjuti',
  }

  const getIcon = (status: string) => {
    switch (status) {
      case 'BELUM_DITINDAKLANJUTI': return <MdHourglassEmpty size={20} />
      case 'SEDANG_DITINDAKLANJUTI': return <MdSearch size={20} />
      case 'SUDAH_DITINDAKLANJUTI': return <MdCheckCircle size={20} />
      case 'TIDAK_BISA_DITINDAKLANJUTI': return <MdCancel size={20} />
      default: return <MdHourglassEmpty size={20} />
    }
  }

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">ID Laporan</p>
          <p className="font-mono font-bold text-[var(--color-text)]">{aspirasi.id_laporan}</p>
        </div>
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
          <span className="text-[var(--color-text-secondary)]">Alamat:</span>
          <span className="text-[var(--color-text)]">{aspirasi.lokasi || '-'}</span>
          <span className="text-[var(--color-text)]">{aspirasi.kelurahan || '-'},</span>
          <span className="text-[var(--color-text)]">{aspirasi.kecamatan || '-'},</span>
          <span className="text-[var(--color-text)]">{aspirasi.kota || '-'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MdSource size={16} className="text-[var(--color-text-secondary)] shrink-0" />
          <span className="text-[var(--color-text-secondary)]">Sumber:</span>
          <span className="text-[var(--color-text)]">{aspirasi.sumber.replace(/_/g, ' ')}</span>
        </div>
        <div className="flex items-start gap-2 col-span-2">
          <MdDescription size={16} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
          <span className="text-[var(--color-text)]">{aspirasi.deskripsi}</span>
        </div>
      </div>

      <div className="relative pt-2">
        {trackings.length === 0 && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                <MdHourglassEmpty size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">Laporan Anda Diterima</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {new Date(aspirasi.tanggal_dibuat).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )}
        {trackings.map((t, i) => {
          const isLast = i === trackings.length - 1 && !['SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI'].includes(t.status)
          return (
            <div key={t.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors ${
                  t.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                }`}>
                  {getIcon(t.status)}
                </div>
                {!isLast && <div className="w-0.5 flex-1 bg-[var(--color-primary)]" />}
              </div>
              <div className={`${isLast ? '' : 'pb-4'}`}>
                <p className={`text-sm font-medium ${
                  t.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                    ? 'text-red-600'
                    : 'text-[var(--color-text)]'
                }`}>
                  {statusLabelMap[t.status] ?? t.status.replace(/_/g, ' ')}
                </p>
                {t.lampiran && t.lampiran.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {t.lampiran.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            fetch(url).then(r => r.blob()).then(blob => {
                              window.open(URL.createObjectURL(blob), '_blank')
                            })
                          }}
                          className="inline-flex items-center gap-1 py-1.5 text-xs font-medium text-blue-600 transition-colors cursor-pointer"
                        >
                          <MdDescription size={14} />
                          Klik untuk Melihat Detail
                        </button>
                      )
                    )}
                  </div>
                )}
                {t.catatan && (
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">"{t.catatan}"</p>
                )}
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(t.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        {trackings.length > 0 && ['SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI'].includes(trackings[trackings.length - 1].status) && (
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-green-100 text-green-600">
                <MdCheckCircle size={20} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Selesai</p>
            </div>
          </div>
        )}
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
        href="/"
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
