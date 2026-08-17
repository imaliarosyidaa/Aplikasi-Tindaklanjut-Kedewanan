'use client'
import React, { useState, useEffect, useRef } from 'react'

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
import Hero from '@/components/shared/Hero'
import { SearchableSelect } from '@/components/ui/searchable-select'
import FilterLaporan from '@/components/shared/Filter'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem {
  id: string
  nama: string
}
interface KecamatanItem {
  id: string
  nama: string
}
interface KelurahanItem {
  id: string
  nama: string
}

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
  console.log(trackBelum)
  console.log(trackSudah)
  // Penentuan tahap aktif/sudah lewat berdasarkan status utama aspirasi
  const isSedangOrBeyond = [
    'SEDANG_DITINDAKLANJUTI',
    'SUDAH_DITINDAKLANJUTI',
    'TIDAK_BISA_DITINDAKLANJUTI',
    'SELESAI',
  ].includes(aspirasi.status)
  const isSudahOrBeyond = ['SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI', 'SELESAI'].includes(aspirasi.status)
  const isSelesai = aspirasi.status === 'SELESAI' || aspirasi.status === 'SUDAH_DITINDAKLANJUTI'

  return (
    <section>
      <Card className="p-4 sm:p-6 space-y-5">
        {/* Header ID Laporan */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
          <div>
            <p className="text-xs text-[var(--color-text-secondary)]">ID Laporan</p>
            <p className="font-mono font-bold text-sm sm:text-base text-[var(--color-text)]">{aspirasi.id_laporan}</p>
          </div>
        </div>

        {/* Detail Informasi Pelapor & Lokasi */}
        <div className="grid grid-cols-1 gap-4 text-xs sm:text-sm">
          {/* Nama Pelapor */}
          <div className="flex items-center gap-2">
            <MdPerson size={18} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="font-medium text-[var(--color-text)] truncate">{aspirasi.pelapor_nama}</span>
          </div>

          {/* Telepon */}
          <div className="flex items-center gap-2">
            <MdPhone size={18} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="text-[var(--color-text)]">{aspirasi.pelapor_telepon}</span>
          </div>

          {/* Sumber */}
          <div className="flex items-center gap-2">
            <MdSource size={18} className="text-[var(--color-text-secondary)] shrink-0" />
            <span className="text-[var(--color-text-secondary)]">Sumber:</span>
            <span className="font-medium text-[var(--color-text)] truncate">{aspirasi.sumber?.replace(/_/g, ' ')}</span>
          </div>

          {/* Alamat (Full Width di HP) */}
          <div className="flex items-start gap-2">
            <MdLocationOn size={18} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-x-1 text-[var(--color-text)]">
              <span className="text-[var(--color-text-secondary)]">Alamat:</span>
              <span>{aspirasi.lokasi || '-'}</span>
              <span>{aspirasi.rt ? `RT ${aspirasi.rt}` : ''}</span>
              <span>{aspirasi.rw ? `RW ${aspirasi.rw},` : ''}</span>
              <span>{aspirasi.kelurahan || '-'}</span>
              <span>{aspirasi.kecamatan || '-'},</span>
              <span>{aspirasi.kota || '-'}</span>
            </div>
          </div>

          {/* Deskripsi (Full Width) */}
          <div className="flex items-start gap-2 col-span-1 sm:col-span-2 pt-1 border-t border-[var(--color-border)]/50">
            <MdDescription size={18} className="text-[var(--color-text-secondary)] shrink-0 mt-0.5" />
            <p className="text-[var(--color-text)] leading-relaxed break-words">{aspirasi.deskripsi}</p>
          </div>
        </div>

        {/* --- TRACKING STATUS MANUAL (TIMELINE) --- */}
        <div className="relative pt-3 border-t border-[var(--color-border)]">
          {/* DIV 1: Belum Ditindaklanjuti */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm bg-amber-100 text-amber-600 shrink-0">
                <MdHourglassEmpty size={18} />
              </div>
              <div
                className={`w-0.5 flex-1 min-h-[24px] ${isSedangOrBeyond ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
              />
            </div>
            <div className="pb-5 flex-1">
              <p className="text-xs sm:text-sm font-semibold text-amber-600">Laporan Anda Diterima</p>
              {trackBelum?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic break-words bg-[var(--color-bg-secondary)]/50 p-2 rounded-md">
                  "{trackBelum.catatan}"
                </p>
              )}
              <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                {new Date(trackBelum?.created_at || aspirasi.tanggal_dibuat).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                WIB
              </p>
              {aspirasi?.lampiran && aspirasi.lampiran.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {aspirasi.lampiran.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        fetch(url)
                          .then((r) => r.blob())
                          .then((blob) => {
                            window.open(URL.createObjectURL(blob), '_blank')
                          })
                      }}
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium transition-colors cursor-pointer w-fit"
                    >
                      <MdDescription size={14} />
                      Lihat Lampiran Detail
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DIV 2: Sedang Ditindaklanjuti */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  isSedangOrBeyond
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                <MdSearch size={18} />
              </div>
              <div
                className={`w-0.5 flex-1 min-h-[24px] ${isSudahOrBeyond ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
              />
            </div>
            <div className="pb-5 flex-1">
              <p
                className={`text-xs sm:text-sm font-semibold ${isSedangOrBeyond ? 'text-[var(--color-text)]' : 'text-gray-400'}`}
              >
                Laporan Anda Sedang Diproses
              </p>

              {trackSedang?.lampiran && trackSedang.lampiran.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {trackSedang.lampiran.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        fetch(url)
                          .then((r) => r.blob())
                          .then((blob) => {
                            window.open(URL.createObjectURL(blob), '_blank')
                          })
                      }}
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium transition-colors cursor-pointer w-fit"
                    >
                      <MdDescription size={14} />
                      Lihat Lampiran Detail
                    </button>
                  ))}
                </div>
              )}

              {trackSedang?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic break-words bg-[var(--color-bg-secondary)]/50 p-2 rounded-md">
                  "{trackSedang.catatan}"
                </p>
              )}

              {trackSedang?.created_at && (
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSedang.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* DIV 3: Sudah / Tidak Bisa Ditindaklanjuti */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                    ? 'bg-red-100 text-red-600'
                    : isSudahOrBeyond
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI' ? (
                  <MdCancel size={18} />
                ) : (
                  <MdCheckCircle size={18} />
                )}
              </div>
              <div className={`w-0.5 flex-1 min-h-[24px] ${isSelesai ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
            </div>
            <div className="pb-5 flex-1">
              <p
                className={`text-xs sm:text-sm font-semibold ${
                  aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                    ? 'text-red-600'
                    : isSudahOrBeyond
                      ? 'text-[var(--color-text)]'
                      : 'text-gray-400'
                }`}
              >
                {aspirasi.status === 'TIDAK_BISA_DITINDAKLANJUTI'
                  ? 'Tidak Dapat Ditindaklanjuti'
                  : 'Laporan Anda Sudah Ditindak Lanjuti'}
              </p>

              {isSudahOrBeyond && trackSudah?.lampiran && trackSudah.lampiran.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  {trackSudah.lampiran.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        fetch(url)
                          .then((r) => r.blob())
                          .then((blob) => {
                            window.open(URL.createObjectURL(blob), '_blank')
                          })
                      }}
                      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-medium transition-colors cursor-pointer w-fit"
                    >
                      <MdDescription size={14} />
                      Lihat Lampiran Detail
                    </button>
                  ))}
                </div>
              )}

              {isSudahOrBeyond && trackSudah?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic break-words bg-[var(--color-bg-secondary)]/50 p-2 rounded-md">
                  "{trackSudah.catatan}"
                </p>
              )}

              {trackSudah?.created_at && (
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSudah.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          {/* DIV 4: Selesai */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                  isSelesai ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                <MdCheckCircle size={18} />
              </div>
            </div>
            <div className="flex-1">
              <p className={`text-xs sm:text-sm font-semibold ${isSelesai ? 'text-green-600' : 'text-gray-400'}`}>
                Selesai
              </p>
              {trackSelesai?.catatan && (
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 italic break-words bg-[var(--color-bg-secondary)]/50 p-2 rounded-md">
                  "{trackSelesai.catatan}"
                </p>
              )}
              {trackSelesai?.created_at && (
                <p className="text-[11px] sm:text-xs text-[var(--color-text-secondary)] mt-1">
                  {new Date(trackSelesai.created_at).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
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
  const searchParamsRef = useRef<{ kotaId: string; kecamatanId: string; kelurahanId: string; q: string; qId: string } | null>(null)

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(kotaId ? `/api/kecamatan?kota=${kotaId}` : null, fetcher)
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : '/api/kelurahan',
    fetcher,
  )

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const optionsRef = useRef({ kotaOptions, kecamatanOptions, kelurahanOptions })
  optionsRef.current = { kotaOptions, kecamatanOptions, kelurahanOptions }

  useEffect(() => {
    if (!searchParamsRef.current) return
    const f = searchParamsRef.current
    const opts = optionsRef.current
    const hasActiveFilter = f.kotaId !== '' || f.kecamatanId !== '' || f.kelurahanId !== '' || f.q !== '' || f.qId !== ''
    if (!hasActiveFilter) return

    const kotaNama = opts.kotaOptions.find((k) => k.value === f.kotaId)?.label ?? ''
    const kecamatanNama = opts.kecamatanOptions.find((k) => k.value === f.kecamatanId)?.label ?? ''
    const kelurahanNama = opts.kelurahanOptions.find((k) => k.value === f.kelurahanId)?.label ?? ''

    const filtered = (allAspirasi ?? []).filter((a) => {
      if (kotaNama && a.kota !== kotaNama) return false
      if (kecamatanNama && a.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && a.kelurahan !== kelurahanNama) return false
      if (f.qId && (a.id_laporan ?? '').toUpperCase() !== f.qId) return false
      if (f.q) {
        const matchNama = a.pelapor_nama?.toLowerCase().includes(f.q)
        const matchTelp = a.pelapor_telepon?.includes(f.q)
        if (!matchNama && !matchTelp) return false
      }
      return true
    })
    setResults(filtered)
    setSearched(true)
  }, [allAspirasi])

  const handleSearch = () => {
    const q = query.toLowerCase().trim()
    const qId = queryId.trim().toUpperCase()

    const hasActiveFilter = kotaId !== '' || kecamatanId !== '' || kelurahanId !== '' || q !== '' || qId !== ''

    if (!hasActiveFilter) {
      setResults([])
      setSearched(false)
      searchParamsRef.current = null
      return
    }

    const params = { kotaId, kecamatanId, kelurahanId, q, qId }
    searchParamsRef.current = params

    const kotaNama = kotaOptions.find((k) => k.value === kotaId)?.label ?? ''
    const kecamatanNama = kecamatanOptions.find((k) => k.value === kecamatanId)?.label ?? ''
    const kelurahanNama = kelurahanOptions.find((k) => k.value === kelurahanId)?.label ?? ''

    const filtered = (allAspirasi ?? []).filter((a) => {
      if (kotaNama && a.kota !== kotaNama) return false
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
      <FilterLaporan searched={searched}>
        {/* 1. Filter Wilayah */}
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[140px] flex-1">
            <Select
              id="kota"
              label="Kota/Kabupaten"
              placeholder="Semua Kota/Kabupaten"
              options={kotaOptions}
              value={kotaId}
              onChange={(e) => {
                setKotaId(e.target.value)
                setKecamatanId('')
                setKelurahanId('')
              }}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <SearchableSelect
              id="kecamatan"
              label="Kecamatan"
              placeholder="Semua Kecamatan"
              options={kecamatanOptions}
              value={kecamatanId}
              onChange={(value) => {
                setKecamatanId(value)
                setKelurahanId('')
              }}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <SearchableSelect
              id="kelurahan"
              label="Kelurahan"
              placeholder="Semua Kelurahan"
              options={kelurahanOptions}
              value={kelurahanId}
              onChange={(value) => setKelurahanId(value)}
            />
          </div>
        </div>

        {/* 2. Input Query Nama / Telp */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              id="query"
              label="Nama atau Nomor Handphone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Contoh: Siti atau 081234567890"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        {/* 3. Input Query ID & Button */}
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              id="queryId"
              label="ID Laporan"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Contoh: LAP-A7B3K9X2P1"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} disabled={!hasFilter}>
            <MdSearch size={18} className="mr-1" />
            Cari
          </Button>
        </div>
      </FilterLaporan>
      {!searched && (
        <div className="lg:h-screen relative z-0 flex items-end justify-center">
          <img src="/laporan.png" alt="Logo" className="lg:w-2/5 opacity-60 h-auto" />
        </div>
      )}

      {searched && (
        <div className="space-y-4 px-4 lg:px-16 pt-8 pb-16">
          {results.length === 0 ? (
            <Card>
              <p className="text-center text-[var(--color-text-secondary)] py-8">
                Tidak ditemukan aspirasi dengan kata kunci tersebut
              </p>
            </Card>
          ) : (
            results.map((aspirasi) => <TrackingTicket key={aspirasi.id} aspirasi={aspirasi} />)
          )}
        </div>
      )}
    </div>
  )
}
