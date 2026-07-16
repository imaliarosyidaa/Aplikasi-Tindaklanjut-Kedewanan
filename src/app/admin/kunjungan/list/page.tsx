'use client'
import React, { useState, useEffect, useCallback } from 'react'
import useSWR from 'swr'

import { Card } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { Link } from '@/routing'
import { MdVisibility, MdEdit, MdDelete } from 'react-icons/md'
import type { Kegiatan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function KunjunganListPage() {
  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const { data: res, isLoading, mutate } = useSWR<{ data: Kegiatan[]; total: number }>(
    `/api/kegiatan?page=${currentPage}&limit=${PAGE_SIZE}`, fetcher
  )
  const data = res?.data ?? []
  const total = res?.total ?? 0
  const [editingItem, setEditingItem] = useState<Kegiatan | null>(null)
  const [saving, setSaving] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const toggleAll = useCallback(() => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.map((item) => item.id)))
    }
  }, [selectedIds.size, data])

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

  if (isLoading) return null

  const formatTanggal = (tanggal: string): string => {
    if (!tanggal) return ''
    const d = new Date(tanggal)
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return
    try {
      const res = await fetch(`/api/kegiatan/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      await mutate()
    } catch { alert('Gagal menghapus kegiatan') }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingItem) return
    setSaving(true)
    try {
      const form = new FormData(e.currentTarget)
      const body = {
        nama_kegiatan: form.get('nama_kegiatan') as string,
        lokasi: form.get('lokasi') as string,
        catatan: form.get('catatan') as string,
      }
      const res = await fetch(`/api/kegiatan/${editingItem.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('Gagal menyimpan')
      setEditingItem(null); await mutate()
    } catch { alert('Gagal menyimpan perubahan') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Daftar Kegiatan</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Daftar kegiatan yang telah diinput</p>
      </div>

      {data.length === 0 ? (
        <Card><p className="text-center text-[var(--color-text-secondary)] py-8">Belum ada data kegiatan</p></Card>
      ) : (
        <>
        <div className="flex items-center justify-end mb-2">
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleting}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
            >
              <MdDelete size={16} /> Hapus {selectedIds.size} Terpilih
            </button>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left w-10">
                  <input type="checkbox" checked={selectedIds.size === data.length && data.length > 0} onChange={toggleAll} className="cursor-pointer" />
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
                  {data.map((item, i) => (
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
                      <Link href={`/admin/kunjungan/kegiatan/${item.id}`} className="text-[var(--color-primary)] cursor-pointer hover:underline"><MdVisibility size={18} /></Link>
                      <Link href={`/admin/kunjungan/edit/${item.id}`} className="text-[var(--color-warning)] cursor-pointer hover:underline"><MdEdit size={18} /></Link>
                      <button type="button" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 cursor-pointer"><MdDelete size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        <div className="flex items-center justify-end mt-4">
          <Pagination currentPage={currentPage} totalItems={total} pageSize={PAGE_SIZE} onPageChange={setCurrentPage} />
        </div>
        </>
      )}

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Kegiatan</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kegiatan</label>
                <input name="nama_kegiatan" defaultValue={editingItem.nama_kegiatan || editingItem.isi}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input name="lokasi" defaultValue={editingItem.lokasi}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                <textarea name="catatan" defaultValue={editingItem.catatan} rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm rounded bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
