import { prisma } from '@/lib/prisma'
import { Gallery4, type Gallery4Item } from '@/components/ui/gallery4'

// Server Component: konten galeri diambil langsung dari tabel `gallery_items`.
export default async function Gallery4Section() {
  const gallery = await prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })

  if (gallery.length === 0) return null

  const items: Gallery4Item[] = gallery.map((g) => ({
    id: g.id,
    title: g.title || 'Tanpa Judul',
    description: g.caption,
    href: '#galeri',
    image: g.url,
  }))

  return (
    <section id="galeri" className="bg-[var(--color-bg)]">
      <Gallery4 items={items} />
    </section>
  )
}