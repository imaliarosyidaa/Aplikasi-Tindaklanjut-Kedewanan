'use client'
import React, { useState } from 'react'
import useSWR from 'swr'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdAccountBalance,
  MdGroups,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface TeamItem {
  id: string
  name: string
  description: string
  is_active: boolean
  member_count: number
  kegiatan_count: number
  relawan_count: number
}

interface DprdItem {
  id: string
  name: string
  description: string
  is_active: boolean
  team_count: number
  user_count: number
  teams: TeamItem[]
}

interface DprdResponse {
  dprds: DprdItem[]
}

export const DprdManager = (): React.ReactNode => {
  const { data, isLoading, mutate } = useSWR<DprdResponse>('/api/dprd', fetcher)
  const dprds = data?.dprds ?? []

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showDprdModal, setShowDprdModal] = useState(false)
  const [editingDprd, setEditingDprd] = useState<DprdItem | null>(null)
  const [dprdForm, setDprdForm] = useState({ name: '', description: '', is_active: true })
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState<TeamItem | null>(null)
  const [teamForm, setTeamForm] = useState({ name: '', description: '' })
  const [teamDprdId, setTeamDprdId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAddDprd = () => {
    setDprdForm({ name: '', description: '', is_active: true })
    setEditingDprd(null)
    setError('')
    setShowDprdModal(true)
  }

  const openEditDprd = (d: DprdItem) => {
    setEditingDprd(d)
    setDprdForm({ name: d.name, description: d.description, is_active: d.is_active })
    setError('')
    setShowDprdModal(true)
  }

  const handleSaveDprd = async () => {
    if (!dprdForm.name.trim()) {
      setError('Nama DPRD wajib diisi')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = !!editingDprd
      const res = await fetch(isEdit ? `/api/dprd/${editingDprd!.id}` : '/api/dprd', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dprdForm),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error ?? `Gagal menyimpan DPRD (HTTP ${res.status})`)
        return
      }
      setShowDprdModal(false)
      setEditingDprd(null)
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan DPRD')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDprd = async (d: DprdItem) => {
    if (!window.confirm(`Hapus DPRD "${d.name}"?`)) return
    const res = await fetch(`/api/dprd/${d.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      alert(json?.error ?? 'Gagal menghapus DPRD')
      return
    }
    await mutate()
  }

  const openAddTeam = (dprdId: string) => {
    setTeamForm({ name: '', description: '' })
    setEditingTeam(null)
    setTeamDprdId(dprdId)
    setError('')
    setShowTeamModal(true)
  }

  const openEditTeam = (team: TeamItem) => {
    setEditingTeam(team)
    setTeamForm({ name: team.name, description: team.description })
    setTeamDprdId('')
    setError('')
    setShowTeamModal(true)
  }

  const handleSaveTeam = async () => {
    if (!teamForm.name.trim()) {
      setError('Nama tim kerja wajib diisi')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = !!editingTeam
      const res = await fetch(isEdit ? `/api/teams/${editingTeam!.id}` : '/api/teams', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit ? teamForm : { ...teamForm, dprd_id: teamDprdId },
        ),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setError(json?.error ?? `Gagal menyimpan tim kerja (HTTP ${res.status})`)
        return
      }
      setShowTeamModal(false)
      setEditingTeam(null)
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan tim kerja')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTeam = async (team: TeamItem) => {
    if (!window.confirm(`Hapus tim kerja "${team.name}"?`)) return
    const res = await fetch(`/api/teams/${team.id}`, { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      alert(json?.error ?? 'Gagal menghapus tim kerja')
      return
    }
    await mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Master Data DPRD</h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Kelola DPRD dan Tim Kerja untuk pemisahan data (data scoping)
          </p>
        </div>
        <Button size="sm" onClick={openAddDprd}>
          <MdAdd size={16} className="mr-1" />
          Tambah DPRD
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : dprds.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Belum ada data DPRD. Klik &quot;Tambah DPRD&quot; untuk menambahkan.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {dprds.map((d) => {
            const expanded = expandedId === d.id
            return (
              <Card key={d.id} className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MdAccountBalance size={22} className="text-[var(--color-primary)]" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[var(--color-text)]">{d.name}</span>
                        {!d.is_active && <Badge variant="danger">Non-aktif</Badge>}
                      </div>
                      {d.description && (
                        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {d.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">{d.team_count} Tim</Badge>
                    <Badge variant="default">{d.user_count} User</Badge>
                    <button
                      onClick={() => setExpandedId(expanded ? null : d.id)}
                      className="cursor-pointer rounded-lg p-1.5 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
                      title={expanded ? 'Tutup daftar tim' : 'Buka daftar tim'}
                    >
                      {expanded ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                    </button>
                    <button
                      onClick={() => openEditDprd(d)}
                      className="cursor-pointer rounded-lg p-1.5 text-[var(--color-warning)] hover:bg-[var(--color-bg-secondary)]"
                      title="Edit DPRD"
                    >
                      <MdEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteDprd(d)}
                      className="cursor-pointer rounded-lg p-1.5 text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
                      title="Hapus DPRD"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
                        <MdGroups size={16} />
                        Tim Kerja
                      </p>
                      <Button size="sm" variant="outline" onClick={() => openAddTeam(d.id)}>
                        <MdAdd size={14} className="mr-1" />
                        Tambah Tim
                      </Button>
                    </div>

                    {d.teams.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Belum ada tim kerja untuk DPRD ini.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {d.teams.map((t) => (
                          <div
                            key={t.id}
                            className="rounded-lg border border-[var(--color-border)] p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[var(--color-text)]">{t.name}</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditTeam(t)}
                                  className="cursor-pointer rounded-lg p-1 text-[var(--color-warning)] hover:bg-[var(--color-bg-secondary)]"
                                  title="Edit tim"
                                >
                                  <MdEdit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTeam(t)}
                                  className="cursor-pointer rounded-lg p-1 text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
                                  title="Hapus tim"
                                >
                                  <MdDelete size={16} />
                                </button>
                              </div>
                            </div>
                            {t.description && (
                              <p className="text-xs text-[var(--color-text-secondary)]">
                                {t.description}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              <Badge variant="default">{t.member_count} Anggota</Badge>
                              <Badge variant="info">{t.kegiatan_count} Kegiatan</Badge>
                              <Badge variant="success">{t.relawan_count} Relawan</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {(showDprdModal || editingDprd) && (
        <Modal
          isOpen
          onClose={() => {
            setShowDprdModal(false)
            setEditingDprd(null)
          }}
          title={editingDprd ? `Edit DPRD: ${editingDprd.name}` : 'Tambah DPRD Baru'}
          className="max-w-xl"
        >
          <div className="space-y-4">
            <Input
              id="dprd-name"
              label="Nama DPRD"
              placeholder="contoh: Hj. Yuke Yurike, ST, MM"
              value={dprdForm.name}
              onChange={(e) => setDprdForm({ ...dprdForm, name: e.target.value })}
            />
            <Input
              id="dprd-desc"
              label="Deskripsi"
              placeholder="Deskripsi singkat DPRD"
              value={dprdForm.description}
              onChange={(e) => setDprdForm({ ...dprdForm, description: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm text-[var(--color-text)] cursor-pointer">
              <input
                type="checkbox"
                checked={dprdForm.is_active}
                onChange={(e) => setDprdForm({ ...dprdForm, is_active: e.target.checked })}
                className="cursor-pointer"
              />
              DPRD aktif
            </label>

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDprdModal(false)
                  setEditingDprd(null)
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSaveDprd} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {(showTeamModal || editingTeam) && (
        <Modal
          isOpen
          onClose={() => {
            setShowTeamModal(false)
            setEditingTeam(null)
          }}
          title={editingTeam ? `Edit Tim Kerja: ${editingTeam.name}` : 'Tambah Tim Kerja'}
          className="max-w-xl"
        >
          <div className="space-y-4">
            <Input
              id="team-name"
              label="Nama Tim Kerja"
              placeholder="contoh: Pansus Anggaran"
              value={teamForm.name}
              onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
            />
            <Input
              id="team-desc"
              label="Deskripsi"
              placeholder="Deskripsi singkat tim kerja"
              value={teamForm.description}
              onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
            />

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTeamModal(false)
                  setEditingTeam(null)
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSaveTeam} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
