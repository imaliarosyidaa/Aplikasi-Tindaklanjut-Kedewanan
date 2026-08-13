import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [users, roles, dprds] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        roleRef: true,
        dprd: { select: { name: true } },
        userTeams: { include: { team: { select: { name: true } } } },
      },
    }),
    prisma.role.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.dprd.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ])

  return NextResponse.json({
    roles,
    dprds,
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email ?? '',
      name: u.name,
      role: u.role,
      role_id: u.role_id ?? '',
      role_name: u.roleRef?.name ?? '',
      dprd_id: u.dprd_id ?? '',
      dprd_name: u.dprd?.name ?? '',
      teams: u.userTeams.map((t) => ({
        team_id: t.team_id,
        team_name: t.team.name,
        role: t.role,
      })),
      created_at: u.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { username, email, password, name, role, role_id, dprd_id } = body as {
    username?: string
    email?: string
    password?: string
    name?: string
    role?: 'admin' | 'user'
    role_id?: string
    dprd_id?: string
  }
  const teams = Array.isArray(body?.teams)
    ? (body.teams as { team_id: string; role?: 'KETUA' | 'ANGGOTA' }[])
    : []

  if (!username || !username.trim() || !password || !name || !name.trim()) {
    return NextResponse.json(
      { error: 'Username, nama, dan password wajib diisi' },
      { status: 400 },
    )
  }

  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ username: username.trim() }, ...(email?.trim() ? [{ email: email.trim() }] : [])],
    },
  })
  if (exists) {
    return NextResponse.json({ error: 'Username atau email sudah terdaftar' }, { status: 409 })
  }

  const roleRef = role_id ? await prisma.role.findUnique({ where: { id: role_id } }) : null
  if (role_id && !roleRef) {
    return NextResponse.json({ error: 'Role tidak ditemukan' }, { status: 404 })
  }

  const dprdRef = dprd_id ? await prisma.dprd.findUnique({ where: { id: dprd_id } }) : null
  if (!dprd_id || !dprdRef) {
    return NextResponse.json({ error: 'Linked with DPRD wajib dipilih' }, { status: 400 })
  }

  const validTeams = teams.length
    ? await prisma.team.findMany({ where: { id: { in: teams.map((t) => t.team_id) } }, select: { id: true } })
    : []
  const validTeamIds = new Set(validTeams.map((t) => t.id))

  const created = await prisma.user.create({
    data: {
      username: username.trim(),
      email: email?.trim() || null,
      password,
      name: name.trim(),
      role: role ?? 'user',
      role_id: role_id ?? null,
      dprd_id,
      userTeams: {
        create: teams
          .filter((t) => validTeamIds.has(t.team_id))
          .map((t) => ({ team_id: t.team_id, role: t.role ?? 'ANGGOTA' })),
      },
    },
    include: {
      roleRef: true,
      dprd: { select: { name: true } },
      userTeams: { include: { team: { select: { name: true } } } },
    },
  })

  return NextResponse.json(
    {
      id: created.id,
      username: created.username,
      email: created.email ?? '',
      name: created.name,
      role: created.role,
      role_id: created.role_id ?? '',
      role_name: created.roleRef?.name ?? '',
      dprd_id: created.dprd_id ?? '',
      dprd_name: created.dprd?.name ?? '',
      teams: created.userTeams.map((t) => ({
        team_id: t.team_id,
        team_name: t.team.name,
        role: t.role,
      })),
      created_at: created.createdAt.toISOString(),
    },
    { status: 201 },
  )
}
