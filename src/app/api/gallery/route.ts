import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const gallery = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })

  return NextResponse.json({
    items: gallery.map((g) => ({ id: g.id, url: g.url, title: g.title, caption: g.caption })),
  })
}