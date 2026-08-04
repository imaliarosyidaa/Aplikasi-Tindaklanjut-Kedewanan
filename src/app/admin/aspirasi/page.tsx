'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useSWR from 'swr'

import { useAspirasiList } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'
import { Link } from '@/routing'
import { Pagination } from '@/components/ui/pagination'
import { Card } from '@/components/ui/card'
import {
  MdVisibility,
  MdFilterList,
  MdEdit,
  MdDelete,
  MdSearch,
} from 'react-icons/md'
import type { Aspirasi } from '@/types'
import { useSearchParams } from 'next/navigation'

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
  const [searchText, setSearchText] = useState(
    searchParams.get('search') || searchParams.get('query') || ''
  )
  const [filterSumber, setFilterSumber] = useState(
    searchParams.get('sumber') || ''
  )
  const [filterStatus, setFilterStatus] = useState(
    searchParams.get('status') || ''
  )
  const [filterBulan, setFilterBulan] = useState(
    searchParams.get('bulan') || ''
  )
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)

  // Sinkronisasi URL searchParams saat terjadi navigasi dari luar (Chart/Dashboard)
  useEffect(() => {
    setFilterSumber(searchParams.get('sumber') || '')
    setFilterStatus(searchParams.get('status') || '')
    setFilterBulan(searchParams.get('bulan') || '')
    setSearchText(searchParams.get('search') || searchParams.get('query') || '')
  }, [searchParams])

  // Master Data Wilayah
  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : '/api/kecamatan',
    fetcher
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher
  )

  const kotaMap = useMemo(
    () => Object.fromEntries(kotaList.map((k) => [k.id, k.nama])),
    [kotaList]
  )
  const kecamatanMap = useMemo(
    () => Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama])),
    [kecamatanList]
  )
  const kelurahanMap = useMemo(
    () => Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama])),
    [kelurahanList]
  )

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({
    value: k.id,
    label: k.nama,
  }))
  const kelurahanOptions = kelurahanList.map((k) => ({
    value: k.id,
    label: k.nama,
  }))

  // Hook List Aspirasi
  const {
    data: rawAspirasiList = [],
    total,
    isLoading,
    mutate,
  } = useAspirasiList({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchText || undefined,
    sumber: filterSumber || undefined,
    status: filterStatus || undefined,
    kota: kotaMap[kotaId] || searchParams.get('kota') || undefined,
    kecamatan:
      kecamatanMap[kecamatanId] || searchParams.get('kecamatan') || undefined,
    kelurahan:
      kelurahanMap[kelurahanId] || searchParams.get('kelurahan') || undefined,
  })

  // Filter tambahan untuk bulan jika dikirim via URL / Chart
  const aspirasiList = useMemo(() => {
    if (!filterBulan) return rawAspirasiList

    const targetBulan = filterBulan.toLowerCase().trim()
    return rawAspirasiList.filter((item) => {
      if (!item.tanggal_dibuat) return true
      const date = new Date(item.tanggal_dibuat)
      if (isNaN(date.getTime())) return true

      const monthShort = date
        .toLocaleDateString('id-ID', { month: 'short' })
        .toLowerCase()
      const monthLong = date
        .toLocaleDateString('id-ID', { month: 'long' })
        .toLowerCase()

      return (
        monthShort.includes(targetBulan) || monthLong.includes(targetBulan)
      )
    })
  }, [rawAspirasiList, filterBulan])

  const hasFilter =
    Boolean(filterSumber) ||
    Boolean(filterStatus) ||
    Boolean(filterBulan) ||
    Boolean(searchText.trim()) ||
    Boolean(kotaId) ||
    Boolean(kecamatanId) ||
    Boolean(kelurahanId) ||
    Boolean(searchParams.get('kecamatan')) ||
    Boolean(searchParams.get('kelurahan'))

  const handleResetFilter = () => {
    setSearchText('')
    setFilterSumber('')
    setFilterStatus('')
    setFilterBulan('')
    setKotaId('')
    setKecamatanId('')
    setKelurahanId('')
    setCurrentPage(1)
    setSelectedIds(new Set())
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Tracing Aspirasi
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Lacak status tindak lanjut aspirasi
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Filter & Pencarian
            </p>
            {filterBulan && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Filter Bulan: {filterBulan}
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
                  setCurrentPage(1)
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
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
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
                onChange={(e) => {
                  setKotaId(e.target.value)
                  setKecamatanId('')
                  setKelurahanId('')
                }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kecamatan"
                label="Kecamatan"
                placeholder="Semua Kecamatan"
                options={kecamatanOptions}
                value={kecamatanId}
                onChange={(e) => {
                  setKecamatanId(e.target.value)
                  setKelurahanId('')
                }}
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
                disabled={!kecamatanId}
              />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                id="search"
                label="Cari Nama atau No. Telepon"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Ketik nama atau telepon..."
              />
            </div>
            {hasFilter && (
              <Button
                variant="outline"
                size="sm"
                className="mb-0.5"
                onClick={handleResetFilter}
              >
                <MdFilterList size={16} className="mr-1" />
                Tampilkan Semua
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="mb-2 flex items-center justify-end">
        {selectedIds.size > 0 && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkDelete}
            disabled={deleting}
          >
            {deleting ? (
              <div className="mr-1 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <MdDelete size={16} className="mr-1" />
            )}
            Hapus {selectedIds.size} Terpilih
          </Button>
        )}
      </div>

      <div className="w-full overflow-x-auto overflow-hidden rounded-lg border border-[var(--color-border)] shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedIds.size === aspirasiList.length &&
                    aspirasiList.length > 0
                  }
                  onChange={toggleAll}
                  className="cursor-pointer"
                />
              </th>
              <th className="w-12 px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                No
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kecamatan
              </th>
              <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kota/Kabupaten
              </th>
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Sumber
              </th>
              <th className="px-2 py-2 text-left font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Deskripsi
              </th>
              <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Pelapor
              </th>
              <th className="whitespace-nowrap px-2 py-2 text-left font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Tanggal
              </th>
              <th className="whitespace-nowrap px-2 py-2 text-center font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Status
              </th>
              <th className="whitespace-nowrap px-2 py-2 text-center font-medium text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="bg-[var(--color-bg)]">
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
                </td>
              </tr>
            ) : aspirasiList.length === 0 ? (
              <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                  >
                    {hasFilter
                      ? 'Tidak ada aspirasi dengan filter tersebut'
                      : 'Belum ada data aspirasi'}
                  </td>
                </tr>
              ) : (
                aspirasiList.map((aspirasi: Aspirasi, i: number) => (
                  <tr
                    key={aspirasi.id}
                    className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                  >
                    <td className="px-2 py-2 lg:px-4 lg:py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(aspirasi.id)}
                        onChange={() => toggleSelect(aspirasi.id)}
                        className="cursor-pointer"
                      />
                    </td>

                    <td className="px-2 py-2 text-[var(--color-text-secondary)] lg:px-4 lg:py-3">
                      {(currentPage - 1) * PAGE_SIZE + i + 1}
                    </td>

                    <td className="whitespace-nowrap px-2 py-2 lg:px-4 lg:py-3">
                      {aspirasi.kecamatan || '-'}
                    </td>

                    <td className="whitespace-nowrap px-2 py-2 lg:px-4 lg:py-3">
                      {aspirasi.kota || '-'}
                    </td>

                    <td className="px-2 py-2 lg:px-4 lg:py-3">
                      <p className="max-w-[140px] truncate lg:max-w-[220px]">
                        {sumberLabel[aspirasi.sumber] || aspirasi.sumber}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      <p className="line-clamp-2 max-w-[180px] lg:max-w-xs">
                        {aspirasi.deskripsi}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-secondary)]">
                      {aspirasi.pelapor_nama}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(aspirasi.tanggal_dibuat).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-center text-[var(--color-text-secondary)]">
                      <Badge status={aspirasi.status}>
                        {statusLabel[aspirasi.status] || aspirasi.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      <div className="inline-flex items-center justify-center gap-1 lg:gap-2">
                        <Link
                          href={`/admin/aspirasi/${aspirasi.id}`}
                          className="text-[var(--color-primary)] hover:underline"
                          title="Lihat detail"
                        >
                          <MdVisibility className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/aspirasi/edit/${aspirasi.id}`}
                          className="cursor-pointer text-[var(--color-warning)] hover:underline"
                          title="Edit"
                        >
                          <MdEdit size={16} />
                        </Link>

                        <button
                          onClick={async () => {
                            if (
                              deletingId ||
                              !window.confirm('Hapus aspirasi ini?')
                            )
                              return

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
                            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-danger)] border-t-transparent" />
                          ) : (
                            <MdDelete className="h-4 w-4 lg:h-5 lg:w-5" />
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
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={!!selectedAspirasi}
        onClose={() => setSelectedAspirasi(null)}
        title="Update Status"
      >
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