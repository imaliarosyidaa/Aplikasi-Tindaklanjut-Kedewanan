'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import useSWR from 'swr'

import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Link } from '@/routing'
import { MdVisibility, MdEdit, MdDelete, MdClose } from 'react-icons/md'
import type { Kegiatan, MasterKecamatan, MasterKelurahan, MasterKota } from '@/types'
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

// Helper untuk mencocokkan filter bulan ("Feb", "Februari", "2", dsb) dengan tanggal/bulan kegiatan
const isMatchingMonth = (dateOrMonthString: string | undefined, paramBulan: string) => {
  if (!dateOrMonthString || !paramBulan) return true

  const target = paramBulan.toLowerCase().trim()
  const val = dateOrMonthString.toLowerCase().trim()

  // 1. Pengecekan substring langsung ("Feb" di "Februari" atau "12 Feb 2026")
  if (val.includes(target)) return true

  // 2. Jika nilai berupa Date / ISO String (misal "2026-02-15")
  const parsedDate = new Date(dateOrMonthString)
  if (!isNaN(parsedDate.getTime())) {
    const monthIndex = parsedDate.getMonth()
    const shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des']
    const fullMonthNames = [
      'januari',
      'februari',
      'maret',
      'april',
      'mei',
      'juni',
      'juli',
      'agustus',
      'september',
      'oktober',
      'november',
      'desember',
    ]

    return (
      shortMonthNames[monthIndex].includes(target) ||
      fullMonthNames[monthIndex].includes(target) ||
      target === String(monthIndex + 1) ||
      target === String(monthIndex + 1).padStart(2, '0')
    )
  }

  return false
}

export default function KunjunganPage() {
  const searchParams = useSearchParams()
  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)

  // Form Inputs State
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')

  // State Filter Aktif (Sync dengan URL SearchParams)
  const [activeFilters, setActiveFilters] = useState({
    kota: searchParams.get('kota') || '',
    kecamatan: searchParams.get('kecamatan') || '',
    kelurahan: searchParams.get('kelurahan') || '',
    search: searchParams.get('search') || searchParams.get('query') || '',
    bulan: searchParams.get('bulan') || '',
  })

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Master Data Wilayah (masing-masing independen, tidak saling cascade)
  const { data: kotaList = [] } = useSWR<MasterKota[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<MasterKecamatan[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : '/api/kecamatan',
    fetcher,
  )
  const { data: kelurahanList = [] } = useSWR<MasterKelurahan[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : '/api/kelurahan',
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

  // Debounce query pencarian (auto-apply tanpa tombol Cari)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  // Auto-apply: cukup pilih select / ketik, data langsung berubah
  useEffect(() => {
    setActiveFilters({
      kota: kotaMapRef.current[kotaId] || '',
      kecamatan: kecamatanMapRef.current[kecamatanId] || '',
      kelurahan: kelurahanMapRef.current[kelurahanId] || '',
      search: debouncedQuery.trim(),
      bulan: bulanRef.current,
    })
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [kotaId, kecamatanId, kelurahanId, debouncedQuery])

  // Sinkronisasi URL searchParams ke state internal saat URL berubah
  useEffect(() => {
    const paramKota = searchParams.get('kota') || ''
    const paramKec = searchParams.get('kecamatan') || ''
    const paramKel = searchParams.get('kelurahan') || ''
    const paramQuery = searchParams.get('search') || searchParams.get('query') || ''
    const paramBulan = searchParams.get('bulan') || ''

    setQuery(paramQuery)
    setActiveFilters({
      kota: paramKota,
      kecamatan: paramKec,
      kelurahan: paramKel,
      search: paramQuery,
      bulan: paramBulan,
    })
  }, [searchParams])

  // Fetching Data Kegiatan Utama
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
  if (activeFilters.search.trim()) {
    params.set('search', activeFilters.search.trim())
  }

  const {
    data: res,
    isLoading,
    mutate,
  } = useSWR<{ data: Kegiatan[]; total: number }>(`/api/kegiatan?${params.toString()}`, fetcher)
  const allKegiatan = res?.data ?? []
  const total = res?.total ?? 0

  const [editingItem, setEditingItem] = useState<Kegiatan | null>(null)
  const [editForm, setEditForm] = useState({ nama_kegiatan: '', lokasi: '', catatan: '' })

  const hasFilter =
    kotaId ||
    kecamatanId ||
    kelurahanId ||
    query.trim() ||
    activeFilters.kecamatan ||
    activeFilters.kelurahan ||
    activeFilters.bulan

  // Filtering Data di Client Side berdasarkan activeFilters
  const filteredData = useMemo(() => {
    if (!allKegiatan) return []

    return allKegiatan.filter((item) => {
      // 1. Filter Kota
      if (activeFilters.kota && item.kota !== activeFilters.kota) return false

      // 2. Filter Kecamatan
      if (activeFilters.kecamatan && item.kecamatan !== activeFilters.kecamatan) return false

      // 3. Filter Kelurahan
      if (activeFilters.kelurahan && item.kelurahan !== activeFilters.kelurahan) return false

      // 4. Filter Bulan (Dari BarChart / Query Params)
      if (activeFilters.bulan) {
        const dateVal = item.tanggal || (item as unknown as Record<string, string>).tanggal_kegiatan || ''
        if (!isMatchingMonth(dateVal, activeFilters.bulan)) {
          return false
        }
      }

      return true
    })
  }, [allKegiatan, activeFilters])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (selectedIds.size === filteredData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredData.map((item) => item.id)))
    }
  }, [selectedIds.size, filteredData])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Hapus ${selectedIds.size} kegiatan terpilih?`)) return
    setDeleting(true)
    try {
      await fetch('/api/kegiatan/bulk-delete', {
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

  const formatTanggal = (tanggal: string): string => {
    if (!tanggal) return ''
    const d = new Date(tanggal)
    if (isNaN(d.getTime())) return tanggal
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const handleEditSave = async () => {
    if (!editingItem) return
    await fetch(`/api/kegiatan/${editingItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    })
    setEditingItem(null)
    await mutate()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return
    setDeletingId(id)
    try {
      await fetch(`/api/kegiatan/${id}`, { method: 'DELETE' })
      await mutate()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeletingId(null)
    }
  }
  const getSelectValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object' && 'target' in val) {
      return (val as React.ChangeEvent<HTMLSelectElement>).target.value ?? ''
    }
    return ''
  }
  function handleKelurahanChange(value: string) {
    setKelurahanId(value)
    if (!kecamatanId) {
      setKotaId('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Daftar Kegiatan</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Daftar kegiatan yang telah diinput</p>
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
                onChange={(val) => handleKelurahanChange(val)}
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                id="query"
                label="Cari kegiatan / wilayah"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama kegiatan, lokasi, kota, kecamatan, kelurahan..."
              />
            </div>
          </div>
        </div>
      </Card>

      <div>
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

        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="w-10 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredData.length && filteredData.length > 0}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 w-[25%] text-left font-medium text-[var(--color-text-secondary)]">
                  Nama Kegiatan
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tempat Kegiatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  Jalan/Lokasi Detail
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Dibuat Oleh</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tanggal Dibuat</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-bg)]">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center 
text-[var(--color-text-secondary)]"
                  >
                    {hasFilter ? 'Tidak ada kegiatan dengan filter tersebut' : 'Belum ada data kegiatan'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item, i) => (
                  <tr
                    key={item.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {(currentPage - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                      {item.nama_kegiatan || (item as unknown as Record<string, string>).isi || '-'}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{item.lokasi || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {item.alamat || '-'} {item.kelurahan || '-'}, {item.kecamatan || '-'}, {item.kota || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/kunjungan/kegiatan/${item.id}`}
                          className="cursor-pointer text-[var(--color-primary)] hover:underline"
                        >
                          <MdVisibility size={16} />
                        </Link>
                        <Link
                          href={`/admin/kunjungan/edit/${item.id}`}
                          className="cursor-pointer text-[var(--color-warning)] hover:underline"
                        >
                          <MdEdit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="cursor-pointer text-[var(--color-danger)] hover:underline disabled:opacity-40"
                        >
                          {deletingId === item.id ? (
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-danger)] border-t-transparent" />
                          ) : (
                            <MdDelete size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text)]">{item.dibuat_oleh || '-'}</td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {formatTanggal(item.tanggal) || '-'}
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
      </div>

      {/* Modal Edit Quick View */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setEditingItem(null)}
        >
          <Card className="relative w-full max-w-lg space-y-4 p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <MdClose size={20} />
            </button>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Edit Kegiatan</h2>
            <div className="space-y-3">
              <Input
                id="edit-nama"
                label="Nama Kegiatan"
                value={editForm.nama_kegiatan}
                onChange={(e) => setEditForm({ ...editForm, nama_kegiatan: e.target.value })}
              />
              <Input
                id="edit-lokasi"
                label="Lokasi"
                value={editForm.lokasi}
                onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
              />
              <Input
                id="edit-catatan"
                label="Catatan"
                value={editForm.catatan}
                onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingItem(null)}>
                Batal
              </Button>
              <Button onClick={handleEditSave}>Simpan</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
