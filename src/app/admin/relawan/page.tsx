'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import useSWR, { useSWRConfig } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { Link } from '@/routing'
import { useRelawanList } from '@/hooks/useRelawan'
import {
  MdAdd,
  MdPerson,
  MdPhone,
  MdVisibility,
  MdClose,
  MdLocationOn,
  MdWc,
  MdBadge,
  MdEdit,
  MdDelete,
  MdSearch,
} from 'react-icons/md'
import type { Relawan } from '@/types'
import { SearchableSelect } from '@/components/ui/searchable-select'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import { GrPowerReset } from 'react-icons/gr'
import { RadioButton } from '@/components/ui/radio-button'
import { BiFilterAlt } from 'react-icons/bi'

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

const blurNik = (nik: string): string => {
  if (!nik || nik.length <= 3) return nik
  return '*'.repeat(nik.length - 3) + nik.slice(-3)
}

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
  // 1. State Input Form (Sementara)
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')

  // 2. State Filter Terkonfirmasi (Auto-apply saat select/search berubah)
  const [activeFilters, setActiveFilters] = useState({
    kota: '',
    kecamatan: '',
    kelurahan: '',
    query: '',
  })

  // Debounce pencarian agar tidak fetch tiap ketikan (auto-apply tanpa tombol Cari)
  const [debouncedQuery, setDebouncedQuery] = useState(query)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(t)
  }, [query])

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)

  const [preview, setPreview] = useState<Relawan | null>(null)
  const [fullscreenFoto, setFullscreenFoto] = useState('')
  const [edit, setEdit] = useState<Relawan | null>(null)
  const [saving, setSaving] = useState(false)

  // 3. Fetch Data Relawan berdasarkan filter aktif (auto-apply)
  const {
    data: allRelawans = [],
    total,
    isLoading,
    mutate: mutateRelawan,
  } = useRelawanList({
    page: currentPage,
    limit: PAGE_SIZE,
    search: activeFilters.query,
    kota: activeFilters.kota,
    kecamatan: activeFilters.kecamatan,
    kelurahan: activeFilters.kelurahan,
  })

  // 4. Master Data Wilayah
  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : '/api/kecamatan',
    fetcher,
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : '/api/kelurahan',
    fetcher,
  )

  const kotaMap = useMemo(() => Object.fromEntries(kotaList.map((k) => [k.id, k.nama])), [kotaList])
  const kecamatanMap = useMemo(() => Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama])), [kecamatanList])
  const kelurahanMap = useMemo(() => Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama])), [kelurahanList])

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  // Helper extractor nilai Select (aman untuk custom component / e.target.value)
  const getSelectValue = (val: unknown): string => {
    if (typeof val === 'string') return val
    if (val && typeof val === 'object' && 'target' in val) {
      return (val as React.ChangeEvent<HTMLSelectElement>).target.value ?? ''
    }
    return ''
  }

  // Referensi map wilayah agar tidak perlu dependency di efek auto-apply
  const kotaMapRef = useRef(kotaMap)
  const kecamatanMapRef = useRef(kecamatanMap)
  const kelurahanMapRef = useRef(kelurahanMap)

  const [open, setOpen] = useState(false)

  useEffect(() => {
    kotaMapRef.current = kotaMap
    kecamatanMapRef.current = kecamatanMap
    kelurahanMapRef.current = kelurahanMap
  }, [kotaMap, kecamatanMap, kelurahanMap])

  // Auto-apply: cukup pilih select / ketik, data langsung berubah
  useEffect(() => {
    setActiveFilters({
      kota: kotaMapRef.current[kotaId] || '',
      kecamatan: kecamatanMapRef.current[kecamatanId] || '',
      kelurahan: kelurahanMapRef.current[kelurahanId] || '',
      query: debouncedQuery.trim(),
    })
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [kotaId, kecamatanId, kelurahanId, debouncedQuery])

  // Handler Reset Filter
  const handleResetFilter = () => {
    setKotaId('')
    setKecamatanId('')
    setKelurahanId('')
    setQuery('')
    setCurrentPage(1)
    setSelectedIds(new Set())
  }

  const hasFilter =
    Boolean(activeFilters.kota) ||
    Boolean(activeFilters.kecamatan) ||
    Boolean(activeFilters.kelurahan) ||
    Boolean(activeFilters.query.trim()) ||
    Boolean(kotaId) ||
    Boolean(kecamatanId) ||
    Boolean(kelurahanId) ||
    Boolean(query.trim())

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (selectedIds.size === allRelawans.length && allRelawans.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(allRelawans.map((r) => r.id)))
    }
  }, [selectedIds.size, allRelawans])

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!window.confirm(`Hapus ${selectedIds.size} relawan terpilih?`)) return
    setDeleting(true)
    try {
      await fetch('/api/relawan/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      setSelectedIds(new Set())
      await mutateRelawan()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  function handleKelurahanChange(value: string) {
    setKelurahanId(value)
    if (!kecamatanId) {
      setKotaId('')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Data Relawan</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Kelola data relawan DPRD DKI Jakarta</p>
        </div>
        <Link href="/admin/relawan/baru">
          <Button>
            <MdAdd size={18} className="mr-1" />
            Tambah Relawan
          </Button>
        </Link>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => setOpen(true)} label="Filter" variant="outline" className="flex gap-2">
              <BiFilterAlt />
              Filter Lainya
            </Button>
            <div className="flex items-end gap-3">
              <div className="relative flex items-center">
                <MdSearch size={20} className="absolute left-3 bottom-2 text-gray-400 pointer-events-none" />
                <Input
                  id="query"
                  label="Cari Nama atau Telepon"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari nama / no. telepon"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 350 }} role="presentation">
          {/* Header Drawer */}
          <div className="flex p-4 items-center justify-between pb-3 border-b border-gray-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Filter Laporan</h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Isian Form Filter */}
          <div className="flex flex-col">
            <div className="flex flex-col p-3 gap-4">
              <div className="w-full">
                <RadioButton
                  label="Kota/Kabupaten"
                  name="status_laporan"
                  options={kotaOptions}
                  value={kotaId}
                  onChange={(val) => {
                    setKotaId(getSelectValue(val))
                    setKecamatanId('')
                    setKelurahanId('')
                  }}
                  size="md"
                />
              </div>

              <div className="w-full">
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

              <div className="w-full">
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
            <div className="p-3 absolute w-full bottom-0">
              <Button onClick={() => handleResetFilter()} className="w-full gap-2" variant="primary">
                <GrPowerReset />
                Reset
              </Button>
            </div>
          </div>
        </Box>
      </Drawer>

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
                    checked={selectedIds.size === allRelawans.length && allRelawans.length > 0}
                    onChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">NIK</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No. Telepon</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kota/Kabupaten</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                  Posisi Kewilayahan
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--color-bg)]">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                  </td>
                </tr>
              ) : allRelawans.length === 0 ? (
                <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                  <td colSpan={10} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    {hasFilter ? 'Tidak ada relawan dengan filter tersebut' : 'Belum ada data relawan'}
                  </td>
                </tr>
              ) : (
                allRelawans.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {(currentPage - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs tracking-wider">{blurNik(r.nik)}</td>
                    <td className="px-4 py-3">{r.nama}</td>
                    <td className="px-4 py-3">{r.no_telepon}</td>
                    <td className="px-4 py-3">{r.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</td>
                    <td className="px-4 py-3">{r.kota_kabupaten}</td>
                    <td className="px-4 py-3">{r.kecamatan}</td>
                    <td className="px-4 py-3">{r.kelurahan}</td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{POSISI_LABEL[r.posisi] || r.posisi}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreview(preview?.id === r.id ? null : r)}
                          className="cursor-pointer text-[var(--color-primary)] hover:text-[var(--color-primary-dark)]"
                          title="Lihat detail"
                        >
                          <MdVisibility size={18} />
                        </button>
                        <Link
                          href={`/admin/relawan/edit/${r.id}`}
                          className="cursor-pointer text-[var(--color-warning)] hover:text-[var(--color-warning-dark)]"
                          title="Edit"
                        >
                          <MdEdit size={18} />
                        </Link>
                        <button
                          onClick={async () => {
                            if (deletingId || !window.confirm(`Yakin ingin menghapus relawan "${r.nama}"?`)) return
                            setDeletingId(r.id)
                            try {
                              await fetch(`/api/relawan/${r.id}`, { method: 'DELETE' })
                              await mutateRelawan()
                            } catch {
                              alert('Gagal menghapus')
                            } finally {
                              setDeletingId(null)
                            }
                          }}
                          disabled={deletingId === r.id}
                          className="cursor-pointer text-[var(--color-danger)] hover:text-[var(--color-danger-dark)] disabled:opacity-40"
                          title="Hapus"
                        >
                          {deletingId === r.id ? (
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-danger)] border-t-transparent" />
                          ) : (
                            <MdDelete size={18} />
                          )}
                        </button>
                      </div>
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

      {/* Modal Preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setPreview(null)}
        >
          <Card
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 space-y-4 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 cursor-pointer text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <MdClose size={20} />
            </button>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Detail Relawan</h2>
            {preview.foto && (
              <div className="flex justify-center">
                <img
                  src={preview.foto}
                  alt="Foto"
                  onClick={() => setFullscreenFoto(preview.foto!)}
                  className="h-64 w-64 cursor-pointer rounded-full border-4 border-[var(--color-primary-light)] object-cover transition-opacity hover:opacity-80"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 flex items-center gap-2">
                <MdBadge size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">NIK:</span>
                <span className="font-mono text-[var(--color-text)]">{preview.nik}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdPerson size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Nama:</span>
                <span className="text-[var(--color-text)]">{preview.nama}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdPhone size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Telepon:</span>
                <span className="text-[var(--color-text)]">{preview.no_telepon}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdWc size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Jenis Kelamin:</span>
                <span className="text-[var(--color-text)]">
                  {preview.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdLocationOn size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Alamat:</span>
                <span className="text-[var(--color-text)]">{preview.alamat}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-secondary)]">Wilayah:</span>
                <span className="ml-1 text-[var(--color-text)]">
                  {preview.kelurahan},{preview.kecamatan}, {preview.kota_kabupaten}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-secondary)]">Posisi:</span>
                <span className="ml-1 text-[var(--color-text)]">
                  <Badge variant="primary">{POSISI_LABEL[preview.posisi] || preview.posisi}</Badge>
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Fullscreen Foto */}
      {fullscreenFoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
          onClick={() => setFullscreenFoto('')}
        >
          <button
            onClick={() => setFullscreenFoto('')}
            className="absolute top-4 right-4 z-10 cursor-pointer text-white hover:text-gray-300"
          >
            <MdClose size={32} />
          </button>
          <img
            src={fullscreenFoto}
            alt="Foto full"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Modal Edit */}
      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEdit(null)}>
          <Card
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 space-y-4 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEdit(null)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <MdClose size={20} />
            </button>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Edit Relawan</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setSaving(true)
                const form = e.currentTarget
                const data = {
                  nama: (form.elements.namedItem('nama') as HTMLInputElement).value,
                  nik: (form.elements.namedItem('nik') as HTMLInputElement).value,
                  no_telepon: (form.elements.namedItem('no_telepon') as HTMLInputElement).value,
                  jenis_kelamin: (form.elements.namedItem('jenis_kelamin') as HTMLSelectElement).value,
                  posisi: (form.elements.namedItem('posisi') as HTMLSelectElement).value,
                  alamat: (form.elements.namedItem('alamat') as HTMLInputElement).value,
                }
                await fetch(`/api/relawan/${edit.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
                setSaving(false)
                setEdit(null)
                mutateRelawan()
              }}
            >
              <Input id="edit-nama" name="nama" label="Nama Lengkap" defaultValue={edit.nama} required />
              <Input id="edit-nik" name="nik" label="NIK" defaultValue={edit.nik} required />
              <Input
                id="edit-no_telepon"
                name="no_telepon"
                label="No. Telepon"
                type="tel"
                defaultValue={edit.no_telepon}
                required
              />
              <Select
                id="edit-jenis_kelamin"
                name="jenis_kelamin"
                label="Jenis Kelamin"
                options={[
                  { value: 'LAKI_LAKI', label: 'Laki-laki' },
                  { value: 'PEREMPUAN', label: 'Perempuan' },
                ]}
                defaultValue={edit.jenis_kelamin}
              />
              <Select
                id="edit-posisi"
                name="posisi"
                label="Posisi"
                options={[
                  { value: 'KOORDINATOR_RW', label: 'Koordinator RW' },
                  { value: 'KOORDINATOR_RT', label: 'Koordinator RT' },
                  { value: 'KOORDINATOR_KELURAHAN', label: 'Koordinator Kelurahan' },
                  { value: 'KOORDINATOR_KECAMATAN', label: 'Koordinator Kecamatan' },
                  { value: 'FKDM', label: 'FKDM' },
                  { value: 'LMK', label: 'LMK' },
                  { value: 'TOKOH_MASYARAKAT', label: 'Tokoh Masyarakat' },
                  { value: 'PROFESIONAL', label: 'Profesional' },
                ]}
                defaultValue={edit.posisi}
              />
              <Input id="edit-alamat" name="alamat" label="Alamat" defaultValue={edit.alamat} />
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEdit(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
