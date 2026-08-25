'use client'
import React, { useState } from 'react'
import useSWR from 'swr'

import { DprdManager } from '@/components/dprd/DprdManager'
import { WilayahTab } from '@/components/wilayah/WilayahTab'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdLock,
  MdSecurity,
  MdMenuBook,
  MdPerson,
  MdGroup,
  MdAccountBalance,
  MdVisibilityOff,
  MdVisibility,
  MdLocationOn,
} from 'react-icons/md'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface Permission {
  id: string
  name: string
  resource: string
  action: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  permission_ids: string[]
  permission_count: number
}

interface User {
  id: string
  username: string
  email: string
  name: string
  role: string
  role_id: string
  role_name: string
  dprd_id: string
  dprd_name: string
  teams: { team_id: string; team_name: string; role: string }[]
  created_at: string
}

interface TeamOption {
  id: string
  dprd_id: string
  name: string
}

type TeamRole = 'KETUA' | 'ANGGOTA'

type Tab = 'rbac' | 'users' | 'dprd' | 'wilayah'

export default function PengaturanPage() {
  const [tab, setTab] = useState<Tab>('rbac')

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'rbac', label: 'RBAC', icon: <MdSecurity size={18} /> },
    { key: 'users', label: 'Manajemen User', icon: <MdGroup size={18} /> },
    { key: 'dprd', label: 'Master Data DPRD', icon: <MdAccountBalance size={18} /> },
    { key: 'wilayah', label: 'Pengaturan Wilayah', icon: <MdLocationOn size={18} /> },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Pengaturan</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          Manajemen kontrol akses berbasis peran (RBAC) dan pengguna
        </p>
      </div>

      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              tab === t.key
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rbac' && <RbacTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'dprd' && <DprdManager />}
      {tab === 'wilayah' && <WilayahTab />}
    </div>
  )
}

function RbacTab() {
  const { data, isLoading, mutate } = useSWR<{ roles: Role[]; permissions: Permission[] }>(
    '/api/rbac/roles',
    fetcher
  )
  const roles = data?.roles ?? []
  const permissions = data?.permissions ?? []

  const [showAddRole, setShowAddRole] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({ name: '', description: '' })
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAddRole = () => {
    setRoleForm({ name: '', description: '' })
    setSelectedPerms(new Set())
    setError('')
    setShowAddRole(true)
  }

  const openEditRole = (role: Role) => {
    setEditingRole(role)
    setRoleForm({ name: role.name, description: role.description })
    setSelectedPerms(new Set(role.permission_ids))
    setError('')
  }

  const togglePerm = (id: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSaveRole = async () => {
    if (!roleForm.name.trim()) {
      setError('Nama role wajib diisi')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = !!editingRole
      const res = await fetch(
        isEdit ? `/api/rbac/roles/${editingRole!.id}` : '/api/rbac/roles',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: roleForm.name,
            description: roleForm.description,
            permission_ids: Array.from(selectedPerms),
          }),
        }
      )
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(json?.error ?? `Gagal menyimpan role (HTTP ${res.status})`)
        return
      }
      setShowAddRole(false)
      setEditingRole(null)
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (role: Role) => {
    if (!window.confirm(`Hapus role "${role.name}"?`)) return
    await fetch(`/api/rbac/roles/${role.id}`, { method: 'DELETE' })
    await mutate()
  }

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, p) => {
    ;(acc[p.resource] = acc[p.resource] ?? []).push(p)
    return acc
  }, {})

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
              <MdSecurity size={20} />
              Manajemen Role
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Kelola role dan izin akses (permission) untuk setiap role
            </p>
          </div>
          <Button size="sm" onClick={openAddRole}>
            <MdAdd size={16} className="mr-1" />
            Tambah Role
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center py-12">
            Belum ada role. Klik &quot;Tambah Role&quot; untuk membuat role baru.
          </p>
        ) : (
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-lg border border-[var(--color-border)] p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <MdLock size={16} className="text-[var(--color-primary)]" />
                    <span className="font-medium text-[var(--color-text)]">{role.name}</span>
                    <Badge variant="primary">{role.permission_count} izin</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditRole(role)}
                      className="cursor-pointer p-1.5 rounded-lg text-[var(--color-warning)] hover:bg-[var(--color-bg-secondary)]"
                      title="Edit role"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="cursor-pointer p-1.5 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
                      title="Hapus role"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
                {role.description && (
                  <p className="text-xs text-[var(--color-text-secondary)]">{role.description}</p>
                )}
                {role.permission_ids.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {role.permission_ids.map((pid) => {
                      const perm = permissions.find((p) => p.id === pid)
                      return (
                        perm && (
                          <Badge key={pid} variant="default">
                            {perm.resource}:{perm.action}
                          </Badge>
                        )
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-secondary)] italic">
                    Belum ada permission
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2 mb-1">
          <MdMenuBook size={20} />
          Daftar Permission
        </h2>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">
          Daftar izin akses berdasarkan resource dan aksi yang dapat diatur
        </p>

        {Object.keys(groupedPermissions).length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] text-center py-12">
            Belum ada permission.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="info">{resource || '(tanpa resource)'}</Badge>
                  <span className="text-xs text-[var(--color-text-secondary)]">{perms.length} aksi</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p) => (
                    <Badge key={p.id} variant={p.action === 'delete' ? 'danger' : 'success'}>
                      {p.action} {p.description ? `— ${p.description}` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {(showAddRole || editingRole) && (
        <Modal
          isOpen
          onClose={() => {
            setShowAddRole(false)
            setEditingRole(null)
          }}
          title={editingRole ? `Edit Role: ${editingRole.name}` : 'Tambah Role Baru'}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="role-name"
                label="Nama Role"
                placeholder="contoh: Supervisor Wilayah"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                disabled={!!editingRole}
              />
              <Input
                id="role-desc"
                label="Deskripsi"
                placeholder="Deskripsi singkat role"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text)] mb-2">
                Pilih Permission
              </p>
              {Object.keys(groupedPermissions).length === 0 ? (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Belum ada permission yang tersedia.
                </p>
              ) : (
                <div className="max-h-64 overflow-y-auto rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div key={resource} className="p-3">
                      <p className="text-xs font-medium text-[var(--color-text)] mb-2">
                        {resource || '(tanpa resource)'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((p) => (
                          <label
                            key={p.id}
                            className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPerms.has(p.id)}
                              onChange={() => togglePerm(p.id)}
                              className="cursor-pointer"
                            />
                            {p.action}
                            {p.description ? ` (${p.description})` : ''}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAddRole(false)
                  setEditingRole(null)
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSaveRole} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersTab() {
  const { data, isLoading, mutate } = useSWR<
    { roles: { id: string; name: string }[]; users: User[]; dprds: { id: string; name: string }[] }
  >('/api/rbac/users', fetcher)
  const { data: teamsData } = useSWR<{ teams: TeamOption[] }>('/api/teams', fetcher)
  const [showPassword, setShowPassword] = useState(false)
  const roles = data?.roles ?? []
  const users = data?.users ?? []
  const dprds = data?.dprds ?? []
  const teams = teamsData?.teams ?? []

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role_id: '',
    dprd_id: '',
  })
  const [teamSelections, setTeamSelections] = useState<Record<string, TeamRole>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const openAdd = () => {
    setForm({
      username: '',
      email: '',
      password: '',
      name: '',
      role_id: '',
      dprd_id: '',
    })
    setTeamSelections({})
    setError('')
    setShowAdd(true)
  }

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({
      username: u.username,
      email: u.email,
      password: '',
      name: u.name,
      role_id: u.role_id,
      dprd_id: u.dprd_id,
    })
    setTeamSelections(
      u.teams.reduce<Record<string, TeamRole>>((acc, t) => {
        acc[t.team_id] = (t.role as TeamRole) || 'ANGGOTA'
        return acc
      }, {}),
    )
    setError('')
  }

  const availableTeams = dprds.some((d) => d.id === form.dprd_id)
    ? teams.filter((t) => t.dprd_id === form.dprd_id)
    : []

  const handleSave = async () => {
    if (!form.username.trim() || !form.name.trim() || (!editing && !form.password)) {
      setError('Username, nama, dan password wajib diisi')
      return
    }
    setSaving(true)
    setError('')
    try {
      const isEdit = !!editing
      const payload: Record<string, unknown> = {
        username: form.username,
        email: form.email,
        name: form.name,
        role_id: form.role_id,
        role: 'admin',
        dprd_id: form.dprd_id,
        teams: Object.entries(teamSelections).map(([team_id, role]) => ({ team_id, role })),
      }
      if (form.password) payload.password = form.password

      const res = await fetch(isEdit ? `/api/rbac/users/${editing!.id}` : '/api/rbac/users', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(json?.error ?? `Gagal menyimpan user (HTTP ${res.status})`)
        return
      }
      setShowAdd(false)
      setEditing(null)
      await mutate()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Hapus user "${u.username}"?`)) return
    await fetch(`/api/rbac/users/${u.id}`, { method: 'DELETE' })
    await mutate()
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)] flex items-center gap-2">
            <MdGroup size={20} />
            Manajemen Pengguna
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Tambah dan kelola pengguna aplikasi beserta role (RBAC) yang dimiliki
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <MdAdd size={16} className="mr-1" />
          Tambah User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-[var(--color-text-secondary)] text-center py-12">
          Belum ada user. Klik &quot;Tambah User&quot; untuk membuat pengguna baru.
        </p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="rounded-lg border border-[var(--color-border)] p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <MdPerson size={18} className="text-[var(--color-primary)]" />
                  <span className="font-medium text-[var(--color-text)]">{u.name}</span>
                  <Badge variant="default">@{u.username}</Badge>
                  <Badge variant={u.role === 'admin' ? 'primary' : 'default'}>
                    {u.role === 'admin' ? 'Admin' : 'User'}
                  </Badge>
                  {u.role_name && <Badge variant="info">{u.role_name}</Badge>}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(u)}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--color-warning)] hover:bg-[var(--color-bg-secondary)]"
                    title="Edit user"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    className="cursor-pointer p-1.5 rounded-lg text-[var(--color-danger)] hover:bg-[var(--color-bg-secondary)]"
                    title="Hapus user"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
              {u.email && (
                <p className="text-xs text-[var(--color-text-secondary)]">{u.email}</p>
              )}
              {u.dprd_name && <Badge variant="info">DPRD: {u.dprd_name}</Badge>}
              {u.teams.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {u.teams.map((t) => (
                    <Badge key={t.team_id} variant="default">
                      {t.team_name}
                      {t.role ? ` (${t.role})` : ''}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showAdd || editing) && (
        <Modal
          isOpen
          onClose={() => {
            setShowAdd(false)
            setEditing(null)
          }}
          title={editing ? `Edit User: ${editing.username}` : 'Tambah User Baru'}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="username"
                label="Username"
                placeholder="contoh: staff1"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={!!editing}
              />
              <Input
                id="user-name"
                label="Nama Lengkap"
                placeholder="contoh: Budi Santoso"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="contoh: budi@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)]">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editing ? 'Kosongkan jika tidak diganti' : 'Password akun'}
                    required
                    className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 pr-11 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                id="user-role-rbac"
                label="Role"
                placeholder="Pilih role (RBAC)"
                options={roles.map((r) => ({ value: r.id, label: r.name }))}
                value={form.role_id}
                onChange={(e) => setForm({ ...form, role_id: e.target.value })}
              />
              <Select
                id="user-dprd"
                label="Linked with DPRD"
                placeholder="Pilih DPRD (opsional)"
                options={dprds.map((d) => ({ value: d.id, label: d.name }))}
                value={form.dprd_id}
                onChange={(e) => {
                  setForm({ ...form, dprd_id: e.target.value })
                  setTeamSelections({})
                }}
              />
            </div>

            {form.dprd_id && (
              <div>
                <p className="text-sm font-medium text-[var(--color-text)] mb-2">
                  Tim Kerja
                </p>
                {availableTeams.length === 0 ? (
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Belum ada tim kerja untuk DPRD ini.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-[var(--color-border)] divide-y divide-[var(--color-border)]">
                    {availableTeams.map((t) => {
                      const checked = teamSelections[t.id] !== undefined
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-2 p-3"
                        >
                          <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--color-text)]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setTeamSelections((prev) => {
                                  const next = { ...prev }
                                  if (checked) delete next[t.id]
                                  else next[t.id] = 'ANGGOTA'
                                  return next
                                })
                              }
                              className="cursor-pointer"
                            />
                            {t.name}
                          </label>
                          {checked && (
                            <select
                              value={teamSelections[t.id]}
                              onChange={(e) =>
                                setTeamSelections((prev) => ({
                                  ...prev,
                                  [t.id]: e.target.value as TeamRole,
                                }))
                              }
                              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-1 text-xs text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] cursor-pointer"
                            >
                              <option value="ANGGOTA">Anggota</option>
                              <option value="KETUA">Ketua</option>
                            </select>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowAdd(false)
                  setEditing(null)
                }}
              >
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  )
}