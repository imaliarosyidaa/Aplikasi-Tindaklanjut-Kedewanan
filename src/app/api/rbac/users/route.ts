import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { roleRef: true },
    }),
    prisma.role.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return NextResponse.json({
    roles,
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email ?? '',
      name: u.name,
      role: u.role,
      role_id: u.role_id ?? '',
      role_name: u.roleRef?.name ?? '',
      created_at: u.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { username, email, password, name, role, role_id } = body as {
    username?: string
    email?: string
    password?: string
    name?: string
    role?: 'admin' | 'user'
    role_id?: string
  }

  if (!username || !username.trim() || !password || !name || !name.trim()) {
    return NextResponse.json(
      { error: 'Username, nama, dan password wajib diisi' },
      { status: 400 }
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

  const created = await prisma.user.create({
    data: {
      username: username.trim(),
      email: email?.trim() || null,
      password,
      name: name.trim(),
      role: role ?? 'user',
      role_id: role_id ?? null,
    },
    include: { roleRef: true },
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
      created_at: created.createdAt.toISOString(),
    },
    { status: 201 }
  )
}