import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const dprds = await prisma.dprd.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { teams: true, users: true } },
      teams: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { userTeams: true, kegiatans: true, relawans: true } } },
      },
    },
  })

  return NextResponse.json(
    dprds.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      is_active: d.is_active,
      created_at: d.createdAt.toISOString(),
      updated_at: d.updatedAt.toISOString(),
      team_count: d._count.teams,
      user_count: d._count.users,
      teams: d.teams.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        is_active: t.is_active,
        member_count: t._count.userTeams,
        kegiatan_count: t._count.kegiatans,
        relawan_count: t._count.relawans,
      })),
    })),
  )
}

export async function POST(request: Request) {
  const body = await request.json()
  const name = body?.name?.trim()

  if (!name) {
    return NextResponse.json({ error: 'Nama DPRD wajib diisi' }, { status: 400 })
  }

  const exists = await prisma.dprd.findUnique({ where: { name } })
  if (exists) {
    return NextResponse.json({ error: 'Nama DPRD sudah terdaftar' }, { status: 409 })
  }

  const created = await prisma.dprd.create({
    data: {
      name,
      description: body?.description?.trim() ?? '',
      is_active: body?.is_active !== undefined ? Boolean(body.is_active) : true,
    },
  })

  return NextResponse.json(
    {
      id: created.id,
      name: created.name,
      description: created.description,
      is_active: created.is_active,
      created_at: created.createdAt.toISOString(),
      updated_at: created.updatedAt.toISOString(),
    },
    { status: 201 },
  )
}
