import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope, teamFilter } from '@/lib/scoping'

export async function POST(request: Request) {
  const { ids } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids harus array tidak kosong' }, { status: 400 })
  }

  const scope = await getDataScope()
  const where: Record<string, unknown> = { id: { in: ids }, ...teamFilter(scope) }

  const result = await prisma.aspirasis.deleteMany({ where })
  return NextResponse.json({ deleted: result.count })
}
