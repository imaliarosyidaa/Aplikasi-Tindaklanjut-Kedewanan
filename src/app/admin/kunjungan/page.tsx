'use client'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import useSWR from 'swr'

import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Link } from '@/routing'
import { MdVisibility, MdSearch, MdEdit, MdDelete, MdClose } from 'react-icons/md'
import type { Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }

export default function KunjunganPage() {
  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)
  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const params = new URLSearchParams()
  params.set('page', String(currentPage))
  params.set('limit', String(PAGE_SIZE))
  if (searched && query.trim()) params.set('search', query.trim())

  const { data: res, mutate } = useSWR<{ data: Kegiatan[]; total: number }>(
    `/api/kegiatan?${params.toString()}`, fetcher
  )
  const allKegiatan = res?.data ?? []
  const total = res?.total ?? 0

  const [editingItem, setEditingItem] = useState<Kegiatan | null>(null)
  const [editForm, setEditForm] = useState({ nama_kegiatan: '', lokasi: '', catatan: '' })

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null, fetcher
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null, fetcher
  )

  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))
  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const handleSearch = () => { setSearched(true); setCurrentPage(1); setSelectedIds(new Set()) }

  const filteredData = useMemo(() => {
    if (!searched) return allKegiatan
    const kotaNama = kotaMap[kotaId] ?? ''
    const kecamatanNama = kecamatanMap[kecamatanId] ?? ''
    const kelurahanNama = kelurahanMap[kelurahanId] ?? ''
    return allKegiatan.filter((item) => {
      if (kotaNama && item.kota !== kotaNama) return false
      if (kecamatanNama && item.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && item.kelurahan !== kelurahanNama) return false
      return true
    })
  }, [searched, allKegiatan, kotaMap, kecamatanMap, kelurahanMap, kotaId, kecamatanId, kelurahanId])

  useEffect(() => { setCurrentPage(1) }, [filteredData.length])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
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
      mutate()
    } catch {
      alert('Gagal menghapus')
    } finally {
      setDeleting(false)
    }
  }

  const formatTanggal = (tanggal: string): string => {
    if (!tanggal) return ''
    const d = new Date(tanggal)
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const openEdit = (item: Kegiatan) => {
    setEditingItem(item)
    setEditForm({ nama_kegiatan: item.nama_kegiatan || '', lokasi: item.lokasi || '', catatan: item.catatan || '' })
  }

  const handleEditSave = async () => {
    if (!editingItem) return
    await fetch(`/api/kegiatan/${editingItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editForm) })
    setEditingItem(null); mutate()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return
    await fetch(`/api/kegiatan/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Daftar Kegiatan</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Daftar kegiatan yang telah diinput</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian</p>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Select id="kota" label="Kota" placeholder="Semua Kota" options={kotaOptions} value={kotaId}
                onChange={(e) => { setKotaId(e.target.value); setKecamatanId(''); setKelurahanId('') }} />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select id="kecamatan" label="Kecamatan" placeholder="Semua Kecamatan" options={kecamatanOptions} value={kecamatanId}
                onChange={(e) => { setKecamatanId(e.target.value); setKelurahanId('') }} disabled={!kotaId} />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select id="kelurahan" label="Kelurahan" placeholder="Semua Kelurahan" options={kelurahanOptions} value={kelurahanId}
                onChange={(e) => setKelurahanId(e.target.value)} disabled={!kecamatanId} />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input id="query" label="Cari kegiatan" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama kegiatan, lokasi..." onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }} />
            </div>
            <Button onClick={handleSearch}><MdSearch size={18} className="mr-1" />Cari</Button>
          </div>
        </div>
      </Card>

        <div>
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
                  <input type="checkbox" checked={selectedIds.size === filteredData.length && filteredData.length > 0} onChange={toggleAll} className="cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama Kegiatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Tanggal</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Lokasi</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kota</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>            
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-[var(--color-text-secondary)]">
                    'Belum ada data kegiatan'
                  </td>
                </tr>
              ) : (filteredData.map((item, i) => (
                <tr key={item.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} className="cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{item.nama_kegiatan || item.isi}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{formatTanggal(item.tanggal)}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.lokasi}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kota}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kecamatan}</td>
                  <td className="px-4 py-3 text-[var(--color-text)]">{item.kelurahan}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link href={`/admin/kunjungan/kegiatan/${item.id}`} className="text-[var(--color-primary)] hover:underline cursor-pointer"><MdVisibility size={16} /></Link>
                      <Link href={`/admin/kunjungan/edit/${item.id}`} className="text-[var(--color-warning)] cursor-pointer hover:underline"><MdEdit size={16} /></Link>
                      <button onClick={() => handleDelete(item.id)} className="text-[var(--color-danger)] hover:underline cursor-pointer"><MdDelete size={16} /></button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end mt-4">
          <Pagination currentPage={currentPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditingItem(null)}>
          <Card className="relative w-full max-w-lg mx-4 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"><MdClose size={20} /></button>
            <h2 className="text-lg font-bold text-[var(--color-text)]">Edit Kegiatan</h2>
            <div className="space-y-3">
              <Input id="edit-nama" label="Nama Kegiatan" value={editForm.nama_kegiatan} onChange={(e) => setEditForm({ ...editForm, nama_kegiatan: e.target.value })} />
              <Input id="edit-lokasi" label="Lokasi" value={editForm.lokasi} onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })} />
              <Input id="edit-catatan" label="Catatan" value={editForm.catatan} onChange={(e) => setEditForm({ ...editForm, catatan: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingItem(null)}>Batal</Button>
              <Button onClick={handleEditSave}>Simpan</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
