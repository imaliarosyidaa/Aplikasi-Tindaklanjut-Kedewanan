'use client'
import React, { useState, useEffect, useCallback } from 'react'

import { useAspirasiList } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'
import { Link } from '@/routing'
import { Pagination } from '@/components/ui/pagination'
import { MdVisibility, MdFilterList, MdDelete } from 'react-icons/md'
import type { Aspirasi } from '@/types'
export default function AspirasiPage(): React.ReactNode {
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
  const [searchText, setSearchText] = useState('')
  const [filterSumber, setFilterSumber] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const { data: aspirasiList, total, mutate } = useAspirasiList({
    page: currentPage,
    limit: PAGE_SIZE,
    search: searchText || undefined,
    sumber: filterSumber || undefined,
    status: filterStatus || undefined,
  })

  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)

  const hasFilter = filterSumber || filterStatus || searchText.trim()
  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()) }, [filterSumber, filterStatus, searchText])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
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
      mutate()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  const sumberOptions = [
    { value: 'LEMBAR_ASPIRASI_RESES', label: 'Lembar Aspirasi Reses' },
    { value: 'LEMBAR_ASPIRASI_SOSPERDA', label: 'Lembar Aspirasi Sosperda' },
    { value: 'ASPIRASI_PROPOSAL_LANGSUNG', label: 'Aspirasi Proposal Langsung' },
    { value: 'KOORDINASI_DINAS_TERKAIT', label: 'Koordinasi Dinas Terkait' },
    { value: 'USULAN_MUSRENBANG_DEWAN', label: 'Usulan Musrenbang Dewan' },
    { value: 'CALL_CENTER', label: 'Call Center' },
  ]

  const statusOptions = [
    { value: 'BELUM_DITINDAKLANJUTI', label: 'Belum Ditindaklanjuti' },
    { value: 'SEDANG_DITINDAKLANJUTI', label: 'Sedang Ditindaklanjuti' },
    { value: 'SUDAH_DITINDAKLANJUTI', label: 'Sudah Ditindaklanjuti' },
    { value: 'TIDAK_BISA_DITINDAKLANJUTI', label: 'Tidak Bisa Ditindaklanjuti' },
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

      <div className="flex flex-wrap gap-3 items-end bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
        <div className="min-w-[160px] flex-1">
          <Select
            id="filter-sumber"
            label="Sumber"
            placeholder="Semua Sumber"
            options={sumberOptions}
            value={filterSumber}
            onChange={(e) => { setFilterSumber(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <Select
            id="filter-status"
            label="Status"
            placeholder="Semua Status"
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <Input
            id="search"
            label="Cari Nama atau No. Telepon"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1) }}
            placeholder="Ketik nama atau telepon..."
          />
        </div>
        {hasFilter && (
          <Button variant="outline" size="sm" className="mb-0.5" onClick={() => { setSearchText(''); setFilterSumber(''); setFilterStatus(''); setCurrentPage(1) }}>
            <MdFilterList size={16} className="mr-1" />
            Tampilkan Semua
          </Button>
        )}
      </div>

      <div className="flex items-center justify-end mb-2">
        {selectedIds.size > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete} disabled={deleting}>
            <MdDelete size={16} className="mr-1" />
            Hapus {selectedIds.size} Terpilih
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox" checked={selectedIds.size === aspirasiList.length && aspirasiList.length > 0} onChange={toggleAll} className="cursor-pointer" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] w-12">No</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kota</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Sumber Aspirasi</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Deskripsi</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Pelapor</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tanggal Dibuat</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Status</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-[var(--color-bg)]">
            {aspirasiList.length === 0 ? (
              <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                <td colSpan={10} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                  {hasFilter ? 'Tidak ada aspirasi dengan filter tersebut' : 'Belum ada data aspirasi'}
                </td>
              </tr>
            ) : (
                aspirasiList.map((aspirasi: Aspirasi, i: number) => (
                <tr key={aspirasi.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(aspirasi.id)} onChange={() => toggleSelect(aspirasi.id)} className="cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">{aspirasi.kecamatan || '-'}</td>
                  <td className="px-4 py-3">{aspirasi.kota || '-'}</td>
                  <td className="px-4 py-3">{sumberLabel[aspirasi.sumber] || aspirasi.sumber}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{aspirasi.deskripsi}</td>
                  <td className="px-4 py-3">{aspirasi.pelapor_nama}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(aspirasi.tanggal_dibuat).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge status={aspirasi.status}>
                      {statusLabel[aspirasi.status] || aspirasi.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Link href={`/admin/aspirasi/${aspirasi.id}`}>
                        <Button variant="ghost" size="sm" className='cursor-pointer text-[var(--color-primary)] whitespace-nowrap'>
                          <MdVisibility size={16} className="mr-1" />
                          Lihat
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={() => setSelectedAspirasi(aspirasi)} className='cursor-pointer whitespace-nowrap'>Update Status</Button>
                      <Button variant="ghost" size="sm" onClick={async () => {
                        if (window.confirm('Hapus aspirasi ini?')) {
                          await fetch(`/api/aspirasi/${aspirasi.id}`, { method: 'DELETE' })
                          mutate()
                        }
                      }} className='cursor-pointer text-[var(--color-danger)] whitespace-nowrap'>
                        <MdDelete size={16} className="mr-1" />Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end">
        <Pagination currentPage={currentPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
      </div>

      <Modal isOpen={!!selectedAspirasi} onClose={() => setSelectedAspirasi(null)} title="Update Status">
        {selectedAspirasi && (
          <FormUpdateAspirasi
            aspirasi={selectedAspirasi}
            onSuccess={() => { setSelectedAspirasi(null); mutate() }}
          />
        )}
      </Modal>
    </div>
  )
}
