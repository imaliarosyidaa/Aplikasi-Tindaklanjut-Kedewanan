import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const showAll = searchParams.get('all') === 'true'

  const where: Record<string, unknown> = {}
  if (!showAll) {
    where.flag = true
  }

  const data = await prisma.kota.findMany({
    where,
    orderBy: { nama: 'asc' },
  })

  const sorted = data.sort((a, b) => {
    if (a.nama === 'Jakarta Selatan') return -1
    if (b.nama === 'Jakarta Selatan') return 1
    return a.nama.localeCompare(b.nama)
  })

  return NextResponse.json(sorted.map((k) => ({
    id: k.id,
    nama: k.nama,
    flag: k.flag,
  })))
}
