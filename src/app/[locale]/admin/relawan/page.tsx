'use client'
import React, { useState, useMemo } from 'react'
import useSWR, { useSWRConfig } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/routing'
import { useRelawanList } from '@/hooks/useRelawan'
import {
  MdGroup,
  MdAdd,
  MdPerson,
  MdPhone,
  MdVisibility,
  MdClose,
  MdLocationOn,
  MdWc,
  MdBadge,
  MdSearch,
  MdEdit,
  MdDelete,
} from 'react-icons/md'
import type { Relawan } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface KotaItem { id: string; nama: string }
interface KecamatanItem { id: string; nama: string }
interface KelurahanItem { id: string; nama: string }

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
  const { data: allRelawans, isLoading } = useRelawanList()
  const { mutate } = useSWRConfig()
  const [preview, setPreview] = useState<Relawan | null>(null)
  const [edit, setEdit] = useState<Relawan | null>(null)
  const [saving, setSaving] = useState(false)

  const [kotaId, setKotaId] = useState('')
  const [kecamatanId, setKecamatanId] = useState('')
  const [kelurahanId, setKelurahanId] = useState('')
  const [query, setQuery] = useState('')
  const [searched, setSearched] = useState(false)

  const { data: kotaList = [] } = useSWR<KotaItem[]>('/api/kota', fetcher)
  const { data: kecamatanList = [] } = useSWR<KecamatanItem[]>(
    kotaId ? `/api/kecamatan?kota=${kotaId}` : null,
    fetcher
  )
  const { data: kelurahanList = [] } = useSWR<KelurahanItem[]>(
    kecamatanId ? `/api/kelurahan?kecamatan=${kecamatanId}` : null,
    fetcher
  )

  const kotaMap = Object.fromEntries(kotaList.map((k) => [k.id, k.nama]))
  const kecamatanMap = Object.fromEntries(kecamatanList.map((k) => [k.id, k.nama]))
  const kelurahanMap = Object.fromEntries(kelurahanList.map((k) => [k.id, k.nama]))

  const kotaOptions = kotaList.map((k) => ({ value: k.id, label: k.nama }))
  const kecamatanOptions = kecamatanList.map((k) => ({ value: k.id, label: k.nama }))
  const kelurahanOptions = kelurahanList.map((k) => ({ value: k.id, label: k.nama }))

  const results = useMemo(() => {
    if (!searched || !allRelawans) return allRelawans ?? []
    const q = query.toLowerCase().trim()
    const kotaNama = kotaMap[kotaId] ?? ''
    const kecamatanNama = kecamatanMap[kecamatanId] ?? ''
    const kelurahanNama = kelurahanMap[kelurahanId] ?? ''

    return allRelawans.filter((r) => {
      if (kotaNama && r.kota_kabupaten !== kotaNama) return false
      if (kecamatanNama && r.kecamatan !== kecamatanNama) return false
      if (kelurahanNama && r.kelurahan !== kelurahanNama) return false
      if (!q) return true
      return (
        r.nama.toLowerCase().includes(q) ||
        r.nik.includes(q) ||
        (r.no_telepon ?? '').includes(q)
      )
    })
  }, [searched, allRelawans, query, kotaMap, kecamatanMap, kelurahanMap, kotaId, kecamatanId, kelurahanId])

  const handleSearch = () => setSearched(true)
  const hasFilter = kotaId || kecamatanId || kelurahanId || query.trim()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Data Relawan
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Kelola data relawan DPRD DKI Jakarta
          </p>
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
          <p className="text-sm font-medium text-[var(--color-text)]">Filter & Pencarian</p>
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[140px] flex-1">
              <Select
                id="kota"
                label="Kota"
                placeholder="Semua Kota"
                options={kotaOptions}
                value={kotaId}
                onChange={(e) => { setKotaId(e.target.value); setKecamatanId(''); setKelurahanId('') }}
              />
            </div>
            <div className="min-w-[160px] flex-1">
              <Select
                id="kecamatan"
                label="Kecamatan"
                placeholder="Semua Kecamatan"
                options={kecamatanOptions}
                value={kecamatanId}
                onChange={(e) => { setKecamatanId(e.target.value); setKelurahanId('') }}
                disabled={!kotaId}
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
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                id="query"
                label="Cari relawan"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nama, NIK, atau No. Telepon"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
            </div>
            <Button onClick={handleSearch} disabled={!hasFilter}>
              <MdSearch size={18} className="mr-1" />
              Cari
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <p className="text-[var(--color-text-secondary)]">Memuat...</p>
      ) : !results || results.length === 0 ? (
        <Card className="p-8 text-center">
          <MdGroup size={48} className="mx-auto text-[var(--color-text-secondary)] mb-3" />
          <p className="text-[var(--color-text-secondary)]">
            {searched ? 'Tidak ditemukan relawan dengan filter tersebut' : 'Belum ada data relawan'}
          </p>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">NIK</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">No. Telepon</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Jenis Kelamin</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kelurahan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Posisi Kewilayahan</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50">
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs tracking-wider">{blurNik(r.nik)}</td>
                  <td className="px-4 py-3">{r.nama}</td>
                  <td className="px-4 py-3">{r.no_telepon}</td>
                  <td className="px-4 py-3">{r.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</td>
                  <td className="px-4 py-3">{r.kecamatan}</td>
                  <td className="px-4 py-3">{r.kelurahan}</td>
                  <td className="px-4 py-3"><Badge variant="primary">{POSISI_LABEL[r.posisi] || r.posisi}</Badge></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setPreview(preview?.id === r.id ? null : r)}
                        className="text-[var(--color-primary)] cursor-pointer hover:text-[var(--color-primary-dark)]"
                        title="Lihat detail"
                      >
                        <MdVisibility size={18} />
                      </button>
                      <button
                        onClick={() => setEdit(r)}
                        className="text-[var(--color-warning)] cursor-pointer hover:text-[var(--color-warning-dark)]"
                        title="Edit"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Yakin ingin menghapus relawan "${r.nama}"?`)) return
                          await fetch(`/api/relawan/${r.id}`, { method: 'DELETE' })
                          mutate('/api/relawan')
                        }}
                        className="text-[var(--color-danger)] cursor-pointer hover:text-[var(--color-danger-dark)]"
                        title="Hapus"
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPreview(null)}>
          <Card className="relative w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <MdClose size={20} />
            </button>

            <h2 className="text-lg font-bold text-[var(--color-text)]">Detail Relawan</h2>

            {preview.foto && (
              <div className="flex justify-center">
                <img
                  src={preview.foto}
                  alt="Foto"
                  className="w-64 h-64 object-cover rounded-full border-4 border-[var(--color-primary-light)]"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2 flex items-center gap-2">
                <MdBadge size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">NIK:</span>
                <span className="text-[var(--color-text)] font-mono">{preview.nik}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdPerson size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Nama:</span>
                <span className="text-[var(--color-text)]">{preview.nama}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdPhone size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Telepon:</span>
                <span className="text-[var(--color-text)]">{preview.no_telepon}</span>
              </div>
              <div className="flex items-center gap-2">
                <MdWc size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">JK:</span>
                <span className="text-[var(--color-text)]">{preview.jenis_kelamin === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <MdLocationOn size={16} className="text-[var(--color-text-secondary)]" />
                <span className="text-[var(--color-text-secondary)]">Alamat:</span>
                <span className="text-[var(--color-text)]">{preview.alamat}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-secondary)]">Wilayah:</span>
                <span className="text-[var(--color-text)] ml-1">
                  {preview.kota_kabupaten}, {preview.kecamatan}, {preview.kelurahan}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--color-text-secondary)]">Posisi:</span>
                <span className="text-[var(--color-text)] ml-1">
                  <Badge variant="primary">{POSISI_LABEL[preview.posisi] || preview.posisi}</Badge>
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {edit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEdit(null)}>
          <Card className="relative w-full max-w-lg mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setEdit(null)}
              className="absolute top-4 right-4 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            >
              <MdClose size={20} />
            </button>

            <h2 className="text-lg font-bold text-[var(--color-text)]">Edit Relawan</h2>

            <form onSubmit={async (e) => {
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
              mutate('/api/relawan')
            }}>
              <Input id="edit-nama" name="nama" label="Nama Lengkap" defaultValue={edit.nama} required />
              <Input id="edit-nik" name="nik" label="NIK" defaultValue={edit.nik} required />
              <Input id="edit-no_telepon" name="no_telepon" label="No. Telepon" type="tel" defaultValue={edit.no_telepon} required />
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
