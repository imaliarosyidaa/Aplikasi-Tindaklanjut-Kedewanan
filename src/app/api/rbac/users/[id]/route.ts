import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
  }

  const roleRef = body.role_id ? await prisma.role.findUnique({ where: { id: body.role_id } }) : null
  if (body.role_id && !roleRef) {
    return NextResponse.json({ error: 'Role tidak ditemukan' }, { status: 404 })
  }

  const dprdRef = body.dprd_id ? await prisma.dprd.findUnique({ where: { id: body.dprd_id } }) : null
  if (body.dprd_id !== undefined && !body.dprd_id) {
    return NextResponse.json({ error: 'Linked with DPRD wajib dipilih' }, { status: 400 })
  }
  if (body.dprd_id && !dprdRef) {
    return NextResponse.json({ error: 'DPRD tidak ditemukan' }, { status: 404 })
  }

  const teams = Array.isArray(body?.teams)
    ? (body.teams as { team_id: string; role?: 'KETUA' | 'ANGGOTA' }[])
    : []

  let validTeamIds: Set<string> = new Set()
  if (teams.length) {
    const validTeams = await prisma.team.findMany({
      where: { id: { in: teams.map((t) => t.team_id) } },
      select: { id: true },
    })
    validTeamIds = new Set(validTeams.map((t) => t.id))
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      email: body.email !== undefined ? (body.email?.trim() || null) : existing.email,
      name: body.name !== undefined ? (body.name as string) : existing.name,
      role: body.role ?? existing.role,
      role_id: body.role_id !== undefined ? (body.role_id || null) : existing.role_id,
      dprd_id: body.dprd_id !== undefined ? body.dprd_id : existing.dprd_id,
      userTeams:
        body.teams !== undefined
          ? {
              deleteMany: {},
              create: teams
                .filter((t) => validTeamIds.has(t.team_id))
                .map((t) => ({ team_id: t.team_id, role: t.role ?? 'ANGGOTA' })),
            }
          : undefined,
    },
    include: {
      roleRef: true,
      dprd: { select: { name: true } },
      userTeams: { include: { team: { select: { name: true } } } },
    },
  })

  return NextResponse.json({
    id: updated.id,
    username: updated.username,
    email: updated.email ?? '',
    name: updated.name,
    role: updated.role,
    role_id: updated.role_id ?? '',
    role_name: updated.roleRef?.name ?? '',
    dprd_id: updated.dprd_id ?? '',
    dprd_name: updated.dprd?.name ?? '',
    teams: updated.userTeams.map((t) => ({
      team_id: t.team_id,
      team_name: t.team.name,
      role: t.role,
    })),
    created_at: updated.createdAt.toISOString(),
  })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus user' }, { status: 500 })
  }
}
