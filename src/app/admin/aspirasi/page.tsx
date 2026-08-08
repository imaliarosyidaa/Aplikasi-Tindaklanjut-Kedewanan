'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import useSWR from 'swr'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'
import { Link } from '@/routing'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import { MdVisibility, MdFilterList, MdEdit, MdDelete, MdSearch } from 'react-icons/md'
import type { Aspirasi, MasterKecamatan, MasterKelurahan, MasterKota } from '@/types'
import { useSearchParams } from 'next/navigation'
import { SearchableSelect } from '@/components/ui/searchable-select'

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

export default function AspirasiPage(): React.ReactNode {
  const searchParams = useSearchParams()

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

  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)

  // State Form Inputs & Filter
  const [searchText, setSearchText] = useState(searchParams.get('search') || searchParams.get('query') || '')
  const [filterSumber, setFilterSumber] = useState(searchParams.get('sumber') || '')
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '')
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')

  // State Filter Aktif (Sync dengan URL SearchParams)
  const [activeFilters, setActiveFilters] = useState({
    kota: searchParams.get('kota') || '',
    kecamatan: searchParams.get('kecamatan') || '',
    kelurahan: searchParams.get('kelurahan') || '',
    search: searchParams.get('search') || searchParams.get('query') || '',
    sumber: searchParams.get('sumber') || '',
    status: searchParams.get('status') || '',
    bulan: searchParams.get('bulan') || '',
  })

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)

  // Debounce pencarian agar tidak fetch tiap ketikan (auto-apply tanpa tombol Cari)
  const [debouncedSearch, setDebouncedSearch] = useState(searchText)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 400)
    return () => clearTimeout(t)
  }, [searchText])

  const { data: kotaList = [] } = useSWR<MasterKota[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<MasterKecamatan[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null,
    fetcher,
  )
  const { data: kelurahanList = [] } = useSWR<MasterKelurahan[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher,
  )
  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  const kotaOptions = [...kotaList]
    .sort((a, b) => {
      if (a.nama === 'Jakarta Selatan') return -1
      if (b.nama === 'Jakarta Selatan') return 1
      return a.nama.localeCompare(b.nama)
    })
    .map((k) => ({ value: k.id, label: k.nama }))

  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))

  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  // Referensi map wilayah agar tidak perlu dependency di efek auto-apply
  const kotaMapRef = useRef(kotaMap)
  const kecamatanMapRef = useRef(kecamatanMap)
  const kelurahanMapRef = useRef(kelurahanMap)

  useEffect(() => {
    kotaMapRef.current = kotaMap
    kecamatanMapRef.current = kecamatanMap
    kelurahanMapRef.current = kelurahanMap
  }, [kotaMap, kecamatanMap, kelurahanMap])

  // Bulan dari URL dipertahankan saat filter lain berubah
  const bulanRef = useRef(activeFilters.bulan)
  useEffect(() => {
    bulanRef.current = activeFilters.bulan
  }, [activeFilters.bulan])

  // Auto-apply: cukup pilih select / ketik, data langsung berubah
  useEffect(() => {
    setActiveFilters({
      kota: kotaMapRef.current[kotaId] || '',
      kecamatan: kecamatanMapRef.current[kecamatanId] || '',
      kelurahan: kelurahanMapRef.current[kelurahanId] || '',
      search: debouncedSearch.trim(),
      sumber: filterSumber,
      status: filterStatus,
      bulan: bulanRef.current,
    })
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [kotaId, kecamatanId, kelurahanId, debouncedSearch, filterSumber, filterStatus])

  // Sinkronisasi URL searchParams ke state internal saat URL berubah
  useEffect(() => {
    const paramKota = searchParams.get('kota') || ''
    const paramKec = searchParams.get('kecamatan') || ''
    const paramKel = searchParams.get('kelurahan') || ''
    const paramQuery = searchParams.get('search') || searchParams.get('query') || ''
    const paramSumber = searchParams.get('sumber') || ''
    const paramStatus = searchParams.get('status') || ''
    const paramBulan = searchParams.get('bulan') || ''

    setSearchText(paramQuery)
    setFilterSumber(paramSumber)
    setFilterStatus(paramStatus)
    setActiveFilters({
      kota: paramKota,
      kecamatan: paramKec,
      kelurahan: paramKel,
      search: paramQuery,
      sumber: paramSumber,
      status: paramStatus,
      bulan: paramBulan,
    })
  }, [searchParams])

  // Fetching Data Aspirasi Utama
  const params = new URLSearchParams()
  params.set('page', String(currentPage))
  params.set('limit', String(PAGE_SIZE))
  if (activeFilters.kota) {
    params.set('kota', activeFilters.kota)
  }
  if (activeFilters.kecamatan) {
    params.set('kecamatan', activeFilters.kecamatan)
  }
  if (activeFilters.kelurahan) {
    params.set('kelurahan', activeFilters.kelurahan)
  }
  if (activeFilters.sumber) {
    params.set('sumber', activeFilters.sumber)
  }
  if (activeFilters.status) {
    params.set('status', activeFilters.status)
  }
  if (activeFilters.search.trim()) {
    params.set('search', activeFilters.search.trim())
  }

  const {
    data: res,
    isLoading,
    mutate,
  } = useSWR<{
    data: Aspirasi[]
    total: number
  }>(`/api/aspirasi?${params.toString()}`, fetcher)
  const rawAspirasiList = res?.data ?? []
  const total = res?.total ?? 0

  // Filter tambahan untuk bulan jika dikirim via URL / Chart
  const aspirasiList = useMemo(() => {
    if (!activeFilters.bulan) return rawAspirasiList

    const targetBulan = activeFilters.bulan.toLowerCase().trim()
    return rawAspirasiList.filter((item) => {
      if (!item.tanggal_dibuat) return true
      const date = new Date(item.tanggal_dibuat)
      if (isNaN(date.getTime())) return true

      const monthShort = date.toLocaleDateString('id-ID', { month: 'short' }).toLowerCase()
      const monthLong = date.toLocaleDateString('id-ID', { month: 'long' }).toLowerCase()

      return monthShort.includes(targetBulan) || monthLong.includes(targetBulan)
    })
  }, [rawAspirasiList, activeFilters.bulan])

  const hasFilter =
    Boolean(activeFilters.kota) ||
    Boolean(activeFilters.kecamatan) ||
    Boolean(activeFilters.kelurahan) ||
    Boolean(activeFilters.sumber) ||
    Boolean(activeFilters.status) ||
    Boolean(activeFilters.bulan) ||
    Boolean(activeFilters.search.trim()) ||
    Boolean(kotaId) ||
    Boolean(kecamatanId) ||
    Boolean(kelurahanId) ||
    Boolean(searchText.trim())

  const handleResetFilter = () => {
    setSearchText('')
    setFilterSumber('')
    setFilterStatus('')
    setKotaId('')
    setKecamatanId('')
    setKelurahanId('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (selectedIds.size === aspirasiList.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(aspirasiList.map((a) => a.id)))
    }
  }, [selectedIds.size, aspirasiList])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Hapus ${selectedIds.size} aspirasi terpilih?`)) return
    setDeleting(true)
    try {
      await fetch('/api/aspirasi/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setSelectedIds(new Set())
      await mutate()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  const sumberOptions = [
    { value: 'LEMBAR_ASPIRASI_RESES', label: 'Lembar Aspirasi Reses' },
    { value: 'LEMBAR_ASPIRASI_SOSPERDA', label: 'Lembar Aspirasi Sosperda' },
    {
      value: 'ASPIRASI_PROPOSAL_LANGSUNG',
      label: 'Aspirasi Proposal Langsung',
    },
    { value: 'KOORDINASI_DINAS_TERKAIT', label: 'Koordinasi Dinas Terkait' },
    { value: 'USULAN_MUSRENBANG_DEWAN', label: 'Usulan Musrenbang Dewan' },
    { value: 'CALL_CENTER', label: 'Call Center' },
  ]

  const statusOptions = [
    { value: 'BELUM_DITINDAKLANJUTI', label: 'Belum Ditindaklanjuti' },
    { value: 'SEDANG_DITINDAKLANJUTI', label: 'Sedang Ditindaklanjuti' },
    { value: 'SUDAH_DITINDAKLANJUTI', label: 'Sudah Ditindaklanjuti' },
    {
      value: 'TIDAK_BISA_DITINDAKLANJUTI',
      label: 'Tidak Bisa Ditindaklanjuti',
    },
  ]

  const getSelectValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object' && 'target' in val) {
      return (val as React.ChangeEvent<HTMLSelectElement>).target.value ?? ''
    }
    return ''
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Tracing Aspirasi</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Lacak status tindak lanjut aspirasi</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian</p>
            {activeFilters.bulan && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Filter Bulan: {activeFilters.bulan}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Select
                id="filter-sumber"
                label="Sumber"
                placeholder="Semua Sumber"
                options={sumberOptions}
                value={filterSumber ?? ''}
                onChange={(e) => {
                  setFilterSumber(e.target.value)
                }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="filter-status"
                label="Status"
                placeholder="Semua Status"
                options={statusOptions}
                value={filterStatus ?? ''}
                onChange={(val) => {
                  const selectedValue = typeof val === 'string' ? val : val?.target?.value
                  setFilterStatus(selectedValue)
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Select
                id="kota"
                label="Kota/Kabupaten"
                placeholder="Semua Kota/Kabupaten"
                options={kotaOptions}
                value={kotaId}
                onChange={(val) => {
                  setKotaId(getSelectValue(val))
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
                onChange={(val) => {
                  setKecamatanId(getSelectValue(val))
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
                onChange={(val) => {
                  setKelurahanId(getSelectValue(val))
                }}
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                id="search"
                label="Cari Nama, Telepon, atau Wilayah"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                }}
                placeholder="Ketik nama, telepon, ID laporan, atau wilayah..."
              />
            </div>
            {hasFilter && (
              <Button variant="outline" size="sm" className="mb-0.5" onClick={handleResetFilter}>
                <MdFilterList size={16} className="mr-1" />
                Tampilkan Semua
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-2 flex items-center justify-end">
        {selectedIds.size > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete} disabled={deleting}>
            {deleting ? (
              <div className="mr-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <MdDelete size={16} className="mr-1" />
            )}
            Hapus {selectedIds.size} Terpilih
          </Button>
        )}
      </div>

      <div className="w-full overflow-x-auto lg:overflow-hidden rounded-lg border border-[var(--color-border)] shadow-sm">
        {/* 🛠️ PERBAIKAN 1: Gunakan text-xs untuk font ringkas & compact */}
        <table className="w-full table-auto text-xs">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              {/* Checkbox */}
              <th className="w-8 px-2 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === aspirasiList.length && aspirasiList.length > 0}
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </th>

              {/* No */}
              <th className="w-8 px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">No</th>

              {/* Wilayah */}
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Kota/Kabupaten</th>
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>

              {/* Sumber */}
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Sumber</th>

              {/* Deskripsi */}
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Deskripsi</th>

              {/* Pelapor & Tanggal */}
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Pelapor</th>
              <th className="w-24 px-2 py-2 text-left font-medium text-[var(--color-text-secondary)]">Tanggal</th>

              {/* Status & Aksi */}
              <th className="w-28 px-2 py-2 text-center font-medium text-[var(--color-text-secondary)]">Status</th>
              <th className="w-20 px-2 py-2 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
              <th className="w-28 px-2 py-2 text-center font-medium text-[var(--color-text-secondary)]">
                Diverifikasi Oleh
              </th>
            </tr>
          </thead>

          <tbody className="bg-[var(--color-bg)]">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                </td>
              </tr>
            ) : aspirasiList.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  {hasFilter ? 'Tidak ada aspirasi dengan filter tersebut' : 'Belum ada data aspirasi'}
                </td>
              </tr>
            ) : (
              aspirasiList.map((aspirasi: Aspirasi, i: number) => (
                <tr
                  key={aspirasi.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                >
                  {/* Checkbox */}
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(aspirasi.id)}
                      onChange={() => toggleSelect(aspirasi.id)}
                      className="cursor-pointer"
                    />
                  </td>

                  {/* No */}
                  <td className="px-2 py-2 text-[var(--color-text-secondary)]">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>

                  {/* Kota */}
                  <td className="px-2 py-2">
                    <span className="line-clamp-1 max-w-[110px]" title={aspirasi.kota || '-'}>
                      {aspirasi.kota || '-'}
                    </span>
                  </td>

                  {/* Kecamatan */}
                  <td className="px-2 py-2">
                    <span className="line-clamp-1 max-w-[100px]" title={aspirasi.kecamatan || '-'}>
                      {aspirasi.kecamatan || '-'}
                    </span>
                  </td>

                  {/* Kelurahan */}
                  <td className="px-2 py-2">
                    <span className="line-clamp-1 max-w-[100px]" title={aspirasi.kelurahan || '-'}>
                      {aspirasi.kelurahan || '-'}
                    </span>
                  </td>

                  {/* Sumber */}
                  <td className="px-2 py-2">
                    <p className="line-clamp-2 max-w-[130px]">{sumberLabel[aspirasi.sumber] || aspirasi.sumber}</p>
                  </td>

                  {/* Deskripsi */}
                  <td className="px-2 py-2 text-[var(--color-text-secondary)]">
                    <p className="line-clamp-2 max-w-[180px]">{aspirasi.deskripsi}</p>
                  </td>

                  {/* Pelapor */}
                  <td className="px-2 py-2 text-[var(--color-text-secondary)]">
                    <span className="line-clamp-1 max-w-[110px]" title={aspirasi.pelapor_nama}>
                      {aspirasi.pelapor_nama}
                    </span>
                  </td>

                  {/* Tanggal */}
                  <td className="px-2 py-2 text-[var(--color-text-secondary)]">
                    {new Date(aspirasi.tanggal_dibuat).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit', // Format singkat (misal: 14 Feb 26)
                    })}
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 text-center text-[var(--color-text-secondary)]">
                    <Badge status={aspirasi.status}>
                      <span className="text-[10px]">{statusLabel[aspirasi.status] || aspirasi.status}</span>
                    </Badge>
                  </td>

                  {/* Aksi */}
                  <td className="px-2 py-2 text-center text-[var(--color-text-secondary)]">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <Link
                        href={`/admin/aspirasi/${aspirasi.id}`}
                        className="text-[var(--color-primary)] hover:underline"
                        title="Lihat detail"
                      >
                        <MdVisibility className="h-3.5 w-3.5" />
                      </Link>

                      <Link
                        href={`/admin/aspirasi/edit/${aspirasi.id}`}
                        className="cursor-pointer text-[var(--color-warning)] hover:underline"
                        title="Edit"
                      >
                        <MdEdit className="h-3.5 w-3.5" />
                      </Link>

                      <button
                        onClick={async () => {
                          if (deletingId || !window.confirm('Hapus aspirasi ini?')) return

                          setDeletingId(aspirasi.id)
                          try {
                            await fetch(`/api/aspirasi/${aspirasi.id}`, {
                              method: 'DELETE',
                            })
                            await mutate()
                          } catch {
                            alert('Gagal menghapus')
                          } finally {
                            setDeletingId(null)
                          }
                        }}
                        disabled={deletingId === aspirasi.id}
                        className="text-[var(--color-danger)] hover:underline disabled:opacity-40"
                        title="Hapus"
                      >
                        {deletingId === aspirasi.id ? (
                          <div className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--color-danger)] border-t-transparent" />
                        ) : (
                          <MdDelete className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Diverifikasi oleh */}
                  <td className="px-2 py-2 text-center text-xs text-[var(--color-text-secondary)]">
                    {(() => {
                      const trackings = aspirasi.trackings
                      if (!trackings || trackings.length === 0) return '-'
                      const latest = trackings.reduce((a, b) =>
                        new Date(a.created_at) > new Date(b.created_at) ? a : b,
                      )
                      return latest.diverifikasi_oleh_nama || '-'
                    })()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Pagination currentPage={currentPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
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
