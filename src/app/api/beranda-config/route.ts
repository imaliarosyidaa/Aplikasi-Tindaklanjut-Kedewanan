import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope } from '@/lib/scoping'
import type { BerandaConfig } from '@/utils/beranda-config'

export async function GET() {
  const [setting, gallery] = await Promise.all([
    prisma.settingPage.findUnique({ where: { id: 1 } }),
    prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } }),
  ])

  const hero = setting
    ? {
        heroImage: setting.heroImage ?? '',
        heroTitle: setting.heroTitle ?? '',
        heroHighlight: setting.heroHighlight ?? '',
        heroSubtitle: setting.heroSubtitle ?? '',
        heroBadge: setting.heroBadge ?? '',
      }
    : { heroImage: '', heroTitle: '', heroHighlight: '', heroSubtitle: '', heroBadge: '' }

  return NextResponse.json({
    ...hero,
    gallery: gallery.map((g) => ({ id: g.id, url: g.url, title: g.title, caption: g.caption })),
  })
}

export async function POST(request: Request) {
  const scope = await getDataScope()
  if (!scope.isGlobal) {
    return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 })
  }

  let body: Partial<BerandaConfig>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body tidak valid' }, { status: 400 })
  }

  const heroData = {
    heroImage: typeof body.heroImage === 'string' ? body.heroImage.trim() : '',
    heroTitle: typeof body.heroTitle === 'string' ? body.heroTitle.trim() : '',
    heroHighlight: typeof body.heroHighlight === 'string' ? body.heroHighlight.trim() : '',
    heroSubtitle: typeof body.heroSubtitle === 'string' ? body.heroSubtitle.trim() : '',
    heroBadge: typeof body.heroBadge === 'string' ? body.heroBadge.trim() : '',
  }

  await prisma.$transaction(async (tx) => {
    await tx.settingPage.upsert({
      where: { id: 1 },
      update: heroData,
      create: { id: 1, ...heroData },
    })

    if (Array.isArray(body.gallery)) {
      await tx.galleryItem.deleteMany()
      const rows = body.gallery
        .map((g, i) => ({
          url: typeof g?.url === 'string' ? g.url.trim() : '',
          title: typeof g?.title === 'string' ? g.title : '',
          caption: typeof g?.caption === 'string' ? g.caption : '',
          sortOrder: i,
        }))
        .filter((g) => g.url)
      if (rows.length > 0) {
        await tx.galleryItem.createMany({ data: rows })
      }
    }
  })

  return NextResponse.json({ success: true })
}