'use client'
import React, { useState, useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { useAspirasiList } from '@/hooks/useAspirasi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import { FormUpdateAspirasi } from '@/components/forms/FormUpdateAspirasi'
import { Link } from '@/routing'
import { MdVisibility, MdFilterList, MdDelete } from 'react-icons/md'
import type { Aspirasi } from '@/types'
export default function AspirasiPage(): React.ReactNode {
  const t = useTranslations('Aspirasi')
  const s = useTranslations('Sumber')
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

  const sumberOptions = [
    { value: 'LEMBAR_ASPIRASI_RESES', label: s('LEMBAR_ASPIRASI_RESES') },
    { value: 'LEMBAR_ASPIRASI_SOSPERDA', label: s('LEMBAR_ASPIRASI_SOSPERDA') },
    { value: 'ASPIRASI_PROPOSAL_LANGSUNG', label: s('ASPIRASI_PROPOSAL_LANGSUNG') },
    { value: 'KOORDINASI_DINAS_TERKAIT', label: s('KOORDINASI_DINAS_TERKAIT') },
    { value: 'USULAN_MUSRENBANG_DEWAN', label: s('USULAN_MUSRENBANG_DEWAN') },
    { value: 'CALL_CENTER', label: s('CALL_CENTER') },
  ]

  const statusOptions = [
    { value: 'BELUM_DITINDAKLANJUTI', label: t('BELUM_DITINDAKLANJUTI') },
    { value: 'SEDANG_DITINDAKLANJUTI', label: t('SEDANG_DITINDAKLANJUTI') },
    { value: 'SUDAH_DITINDAKLANJUTI', label: t('SUDAH_DITINDAKLANJUTI') },
    { value: 'TIDAK_BISA_DITINDAKLANJUTI', label: t('TIDAK_BISA_DITINDAKLANJUTI') },
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
            {t('title')}
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
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kecamatan
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Kota
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('sumber')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('deskripsi')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                {t('pelapor')}
              </th>
              <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
                Tanggal Dibuat
              </th>
              <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">
                {t('title')}
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
              filteredList.map((aspirasi: Aspirasi) => (
                <tr
                  key={aspirasi.id}
                  className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50"
                >
                  <td className="px-4 py-3">{aspirasi.kecamatan || '-'}</td>
                  <td className="px-4 py-3">{aspirasi.kota || '-'}</td>
                  <td className="px-4 py-3">{s(aspirasi.sumber)}</td>
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
                      {t(aspirasi.status)}
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

      <Modal
        isOpen={!!selectedAspirasi}
        onClose={() => setSelectedAspirasi(null)}
        title={t('updateStatus')}
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
