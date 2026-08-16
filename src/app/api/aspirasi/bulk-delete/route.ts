import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope, dprdFilter } from '@/lib/scoping'

export async function POST(request: Request) {
  const { ids } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids harus array tidak kosong' }, { status: 400 })
  }
  const scope = await getDataScope()
  await prisma.aspirasis.deleteMany({ where: { id: { in: ids }, ...dprdFilter(scope) } })
  return NextResponse.json({ deleted: ids.length })
}
