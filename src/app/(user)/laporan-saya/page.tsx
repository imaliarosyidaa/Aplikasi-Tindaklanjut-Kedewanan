'use client'
import React, { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import { useAspirasiList } from '@/hooks/useAspirasi'
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
import Hero from '@/components/shared/Hero'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }

function TrackingTicket({ aspirasi }: { aspirasi: Aspirasi }) {
  const trackings = aspirasi.trackings ?? []

  // Helper untuk mengambil tracking terbaru berdasarkan created_at untuk status tertentu
  const getLatestTracking = (statuses: string[]) => {
    return trackings
      .filter((t) => statuses.includes(t.status))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  // Ambil data tracking TERBARU untuk tiap tahapan
  const trackBelum = getLatestTracking(['BELUM_DITINDAKLANJUTI'])
  const trackSedang = getLatestTracking(['SEDANG_DITINDAKLANJUTI'])
  const trackSudah = getLatestTracking(['SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI'])
  const trackSelesai = getLatestTracking(['SELESAI'])

  // Penentuan tahap aktif/sudah lewat berdasarkan status utama aspirasi
  const isSedangOrBeyond = ['SEDANG_DITINDAKLANJUTI', 'SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI', 'SELESAI'].includes(aspirasi.status)
  const isSudahOrBeyond = ['SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI', 'SELESAI'].includes(aspirasi.status)
  const isSelesai = aspirasi.status === 'SELESAI' || aspirasi.status === 'SUDAH_DITINDAKLANJUTI'

  return (
    <section>
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
            <span className="text-[var(--color-text)]">{aspirasi.sumber?.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-start gap-2 col-span-2">
            <MdDescription size={16} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
            <span className="text-[var(--color-text)]">{aspirasi.deskripsi}</span>
          </div>
        </div>

        {/* --- TRACKING STATUS MANUAL (4 DIV STATIS) --- */}
        <div className="relative pt-2">

          {/* DIV 1: Belum Ditindaklanjuti (Laporan Diterima) */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-amber-100 text-amber-600">
                <MdHourglassEmpty size={20} />
              </div>
              <div className={`w-0.5 flex-1 ${isSedangOrBeyond ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            </div>
            <div className="pb-4">
              <p className="text-sm font-medium text-amber-600">Laporan Anda Diterima</p>
              {trackBelum?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">"{trackBelum.catatan}"</p>
              )}
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                {new Date(trackBelum?.created_at || aspirasi.tanggal_dibuat).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* DIV 2: Sedang Ditindaklanjuti */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSedangOrBeyond
                ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'bg-gray-100 text-gray-400'
                }`}>
                <MdSearch size={20} />
              </div>
              <div className={`w-0.5 flex-1 ${isSudahOrBeyond ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            </div>
            <div className="pb-4">
              <p className={`text-sm font-medium ${isSedangOrBeyond ? 'text-[var(--color-text)]' : 'text-gray-400'}`}>
                Laporan Anda Sedang Diproses
              </p>
              {trackSedang?.lampiran && trackSedang.lampiran.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {trackSedang.lampiran.map((url, idx) => (
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
                  ))}
                </div>
              )}
              {trackSedang?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">"{trackSedang.catatan}"</p>
              )}
              {trackSedang?.created_at && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSedang.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* DIV 3: Sudah / Tidak Bisa Ditindaklanjuti */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                ? 'bg-red-100 text-red-600'
                : isSudahOrBeyond
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                {aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI' ? <MdCancel size={20} /> : <MdCheckCircle size={20} />}
              </div>
              <div className={`w-0.5 flex-1 ${isSelesai ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            </div>
            <div className="pb-4">
              <p className={`text-sm font-medium ${
                aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                  ? 'text-red-600'
                : isSudahOrBeyond
                  ? 'text-[var(--color-text)]'
                  : 'text-gray-400'
                }`}>
                {aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI' ? 'Tidak Dapat Ditindaklanjuti' : 'Laporan Anda Sudah Ditindak Lanjuti'}
              </p>

              {trackSudah?.lampiran && trackSudah.lampiran.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  {trackSudah.lampiran.map((url, idx) => (
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
                  ))}
                </div>
              )}

              {trackSudah?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">"{trackSudah.catatan}"</p>
              )}
              {trackSudah?.created_at && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSudah.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* DIV 4: Selesai */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSelesai ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                <MdCheckCircle size={20} />
              </div>
            </div>
            <div>
              <p className={`text-sm font-medium ${isSelesai ? 'text-green-600' : 'text-gray-400'}`}>
                Selesai
              </p>
              {trackSelesai?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic">"{trackSelesai.catatan}"</p>
              )}
              {trackSelesai?.created_at && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSelesai.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

        </div>
      </Card>
    </section>
  )
}

export default function LaporanSayaPage(): React.ReactNode {
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

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const handleSearch = () => {
    const q = query.toLowerCase().trim()
    const qId = queryId.trim().toUpperCase()

    const hasActiveFilter =
      kotaId !== '' ||
      kecamatanId !== '' ||
      kelurahanId !== '' ||
      q !== '' ||
      qId !== ''

    if (!hasActiveFilter) {
      setResults([])
      setSearched(false)
      return
    }

    const kecamatanNama = kecamatanOptions.find(k => k.value === kecamatanId)?.label ?? ''
    const kelurahanOpts = kecamatanId ? getKelurahanByKecamatanId(kecamatanId) : []
    const kelurahanNama = kelurahanOpts.find(k => k.value === kelurahanId)?.label ?? ''

    const filtered = (allAspirasi ?? []).filter((a) => {
      if (kecamatanNama && a.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && a.kelurahan !== kelurahanNama) return false

      if (qId && (a.id_laporan ?? '').toUpperCase() !== qId) return false

      if (q) {
        const matchNama = a.pelapor_nama?.toLowerCase().includes(q)
        const matchTelp = a.pelapor_telepon?.includes(q)
        if (!matchNama && !matchTelp) return false
      }

      return true
    })

    setResults(filtered)
    setSearched(true)
  }

  const hasFilter = kotaId || kecamatanId || kelurahanId || query.trim() || queryId.trim()

  return (
    <div>
      <Hero
        title="Lacak"
        highlight="Status Aspirasi"
        subtitle="Masukkan nomor registrasi atau identitas pelapor untuk melihat perkembangan aspirasi yang telah diajukan."
      />
      <div className="px-16 w-full mx-auto bg-white border-purple-200">
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian Laporan</p>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Select
                id="kota"
                label="Kota/Kabupaten"
                placeholder="Semua Kota/Kabupaten"
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
        {!searched && (
        <div className='h-screen flex items-end justify-center'>
          <img src="/laporan.png" alt="Logo" className="w-2/5 opacity-60 h-auto" />
        </div>
        )}
      </div>

      {searched && (
        <div className="space-y-4 px-16 pt-8 pb-16">
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
