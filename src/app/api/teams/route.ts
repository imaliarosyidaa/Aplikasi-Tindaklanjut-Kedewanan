import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const teams = await prisma.team.findMany({
    orderBy: { name: 'asc' },
    include: {
      dprd: { select: { name: true } },
      _count: { select: { userTeams: true, kegiatans: true, relawans: true } },
    },
  })

  return NextResponse.json({
    teams: teams.map((t) => ({
      id: t.id,
      dprd_id: t.dprd_id,
      dprd_name: t.dprd.name,
      name: t.name,
      description: t.description,
      is_active: t.is_active,
      member_count: t._count.userTeams,
      kegiatan_count: t._count.kegiatans,
      relawan_count: t._count.relawans,
      created_at: t.createdAt.toISOString(),
    })),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const name = body?.name?.trim()
  const dprdId = body?.dprd_id

  if (!dprdId) {
    return NextResponse.json({ error: 'DPRD wajib dipilih' }, { status: 400 })
  }
  if (!name) {
    return NextResponse.json({ error: 'Nama tim kerja wajib diisi' }, { status: 400 })
  }

  const dprd = await prisma.dprd.findUnique({ where: { id: dprdId } })
  if (!dprd) {
    return NextResponse.json({ error: 'DPRD tidak ditemukan' }, { status: 404 })
  }

  const created = await prisma.team.create({
    data: {
      dprd_id: dprdId,
      name,
      description: body?.description?.trim() ?? '',
      is_active: body?.is_active !== undefined ? Boolean(body.is_active) : true,
    },
  })

  return NextResponse.json(
    {
      id: created.id,
      dprd_id: created.dprd_id,
      name: created.name,
      description: created.description,
      is_active: created.is_active,
      created_at: created.createdAt.toISOString(),
    },
    { status: 201 },
  )
}
