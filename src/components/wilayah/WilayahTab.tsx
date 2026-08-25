'use client'
import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MdSearch, MdLocationOn, MdMap } from 'react-icons/md'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Kota {
  id: string
  nama: string
  flag: boolean
}

interface Kecamatan {
  id: string
  nama: string
  kota_id: string
  flag: boolean
  kelurahan: { id: string; nama: string }[]
}

type StatusFilter = 'all' | 'active' | 'inactive'

export function WilayahTab() {
  return (
    <div className="space-y-6">
      <KotaSection />
      <KecamatanSection />
    </div>
  )
}

function KotaSection() {
  const { data: allKota, isLoading, mutate } = useSWR<Kota[]>('/api/kota?all=true', fetcher)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = allKota ?? []
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((k) => k.nama.toLowerCase().includes(q))
    }
    if (filter === 'active') list = list.filter((k) => k.flag)
    if (filter === 'inactive') list = list.filter((k) => !k.flag)
    return list
  }, [allKota, search, filter])

  const toggleFlag = async (kota: Kota) => {
    if (!kota.flag && !window.confirm(`Nonaktifkan kota "${kota.nama}"? Kecamatan di dalamnya juga tidak akan tampil di form user.`)) {
      return
    }
    setToggling(kota.id)
    try {
      const res = await fetch(`/api/kota/${kota.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: !kota.flag }),
      })
      if (!res.ok) throw new Error('Gagal mengubah status')
      await mutate()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setToggling(null)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdMap size={20} />
            Kota / Kabupaten
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Aktifkan atau nonaktifkan kota. Kota nonaktif tidak tampil di form pengajuan aspirasi.
          </p>
        </div>
        <Badge variant="primary">{allKota?.length ?? 0} total</Badge>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kota..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] p-0.5">
          {([['all', 'Semua'], ['active', 'Aktif'], ['inactive', 'Nonaktif']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-12">Tidak ada data kota</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama Kota</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kota) => (
                <tr key={kota.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">{kota.nama}</td>
                  <td className="px-4 py-3">
                    <Badge variant={kota.flag ? 'success' : 'danger'}>
                      {kota.flag ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleFlag(kota)}
                      disabled={toggling === kota.id}
                      className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
                        kota.flag ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                      }`}
                      title={kota.flag ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          kota.flag ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

function KecamatanSection() {
  const { data: allKecamatan, isLoading, mutate } = useSWR<Kecamatan[]>('/api/kecamatan?all=true', fetcher)
  const { data: allKota } = useSWR<Kota[]>('/api/kota?all=true', fetcher)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  const kotaMap = useMemo(() => {
    const map: Record<string, string> = {}
    ;(allKota ?? []).forEach((k) => { map[k.id] = k.nama })
    return map
  }, [allKota])

  const kotaFlagMap = useMemo(() => {
    const map: Record<string, boolean> = {}
    ;(allKota ?? []).forEach((k) => { map[k.id] = k.flag })
    return map
  }, [allKota])

  const filtered = useMemo(() => {
    let list = allKecamatan ?? []
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((k) => k.nama.toLowerCase().includes(q))
    }
    if (filter === 'active') list = list.filter((k) => k.flag)
    if (filter === 'inactive') list = list.filter((k) => !k.flag)
    return list
  }, [allKecamatan, search, filter])

  const toggleFlag = async (kec: Kecamatan) => {
    if (!kec.flag && !window.confirm(`Nonaktifkan kecamatan "${kec.nama}"?`)) {
      return
    }
    setToggling(kec.id)
    try {
      const res = await fetch(`/api/kecamatan/${kec.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: !kec.flag }),
      })
      if (!res.ok) throw new Error('Gagal mengubah status')
      await mutate()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Terjadi kesalahan')
    } finally {
      setToggling(null)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdLocationOn size={20} />
            Kecamatan
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Aktifkan atau nonaktifkan kecamatan. Kecamatan hanya tampil jika kotanya juga aktif.
          </p>
        </div>
        <Badge variant="primary">{allKecamatan?.length ?? 0} total</Badge>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama kecamatan..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] pl-10 pr-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-[var(--color-border)] p-0.5">
          {([['all', 'Semua'], ['active', 'Aktif'], ['inactive', 'Nonaktif']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                filter === key
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-12">Tidak ada data kecamatan</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--color-bg-secondary)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Nama Kecamatan</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Kota</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Status</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--color-text-secondary)]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kec) => {
                const kotaActive = kotaFlagMap[kec.kota_id]
                return (
                  <tr key={kec.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{kec.nama}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${kotaActive === false ? 'text-[var(--color-text-secondary)] italic' : 'text-[var(--color-text)]'}`}>
                        {kotaMap[kec.kota_id] ?? '-'}
                        {kotaActive === false && ' (kota nonaktif)'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={kec.flag ? 'success' : 'danger'}>
                          {kec.flag ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        {kotaActive === false && (
                          <Badge variant="warning">Kota off</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => toggleFlag(kec)}
                        disabled={toggling === kec.id}
                        className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
                          kec.flag ? 'bg-[var(--color-primary)]' : 'bg-gray-300'
                        }`}
                        title={kec.flag ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            kec.flag ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
