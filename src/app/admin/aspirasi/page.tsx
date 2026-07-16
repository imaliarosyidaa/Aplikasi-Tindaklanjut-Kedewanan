'use client'
import React, { useState, useMemo, useEffect } from 'react'

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
  const { data: aspirasiList, isLoading, mutate } = useAspirasiList()
  const [selectedAspirasi, setSelectedAspirasi] = useState<Aspirasi | null>(null)
  const [searchText, setSearchText] = useState('')
  const [filterSumber, setFilterSumber] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const filteredList = useMemo(() => {
    if (!aspirasiList) return []
    let result = aspirasiList
    if (filterSumber) result = result.filter((a) => a.sumber === filterSumber)
    if (filterStatus) result = result.filter((a) => a.status === filterStatus)
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter((a) =>
        a.pelapor_nama.toLowerCase().includes(q) ||
        a.pelapor_telepon.includes(q)
      )
    }
    return result
  }, [aspirasiList, filterSumber, filterStatus, searchText])

  const hasFilter = filterSumber || filterStatus || searchText.trim()

  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)
  const paginatedData = filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  useEffect(() => { setCurrentPage(1) }, [filteredList.length])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      </div>
    )
  }

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
            onChange={(e) => setFilterSumber(e.target.value)}
          />
        </div>
        <div className="min-w-[160px] flex-1">
          <Select
            id="filter-status"
            label="Status"
            placeholder="Semua Status"
            options={statusOptions}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          />
        </div>
        <div className="min-w-[180px] flex-1">
          <Input
            id="search"
            label="Cari Nama atau No. Telepon"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ketik nama atau telepon..."
          />
        </div>
        {hasFilter && (
          <Button variant="outline" size="sm" className="mb-0.5" onClick={() => { setSearchText(''); setFilterSumber(''); setFilterStatus('') }}>
            <MdFilterList size={16} className="mr-1" />
            Tampilkan Semua
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)]">
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] w-12">No</th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kecamatan
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kota
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Sumber Aspirasi
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Deskripsi
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Pelapor
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Tanggal Dibuat
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
Tracing Aspirasi
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                  <td
                    colSpan={8}
                  className="px-4 py-8 text-center text-[var(--color-text-secondary)]"
                >
                  {hasFilter ? 'Tidak ada aspirasi dengan filter tersebut' : 'Belum ada data aspirasi'}
                </td>
              </tr>
            ) : (
              paginatedData.map((aspirasi: Aspirasi, i: number) => (
                <tr
                  key={aspirasi.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                >
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3">{aspirasi.kecamatan || '-'}</td>
                  <td className="px-4 py-3">{aspirasi.kota || '-'}</td>
                  <td className="px-4 py-3">{sumberLabel[aspirasi.sumber] || aspirasi.sumber}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {aspirasi.deskripsi}
                  </td>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAspirasi(aspirasi)}
                        className='cursor-pointer whitespace-nowrap'
                      >
                        Update Status
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (window.confirm('Hapus aspirasi ini?')) {
                            await fetch(`/api/aspirasi/${aspirasi.id}`, { method: 'DELETE' })
                            mutate()
                          }
                        }}
                        className='cursor-pointer text-[var(--color-danger)] whitespace-nowrap'
                      >
                        <MdDelete size={16} className="mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination currentPage={currentPage} totalItems={filteredList.length} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />

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
