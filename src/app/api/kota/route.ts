import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.kota.findMany({
    orderBy: { nama: 'asc' },
  })

  // Sort: Jakarta Selatan first, then alphabetically
  const sorted = data.sort((a, b) => {
    if (a.nama === 'Jakarta Selatan') return -1
    if (b.nama === 'Jakarta Selatan') return 1
    return a.nama.localeCompare(b.nama)
  })

  return NextResponse.json(sorted)
}
