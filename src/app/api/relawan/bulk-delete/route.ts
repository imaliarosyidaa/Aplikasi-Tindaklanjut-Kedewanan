import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const { ids } = await request.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids harus array tidak kosong' }, { status: 400 })
  }
  await prisma.relawan.deleteMany({ where: { id: { in: ids } } })
  return NextResponse.json({ deleted: ids.length })
}
