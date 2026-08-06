import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const hasPagination = pageParam !== null
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const kotaNama = searchParams.get('kota')
  const kecamatanNama = searchParams.get('kecamatan')
  const kelurahanNama = searchParams.get('kelurahan')
  const kunjunganId = searchParams.get('kunjungan_id')
  const search = searchParams.get('search')?.trim()

  const where: Record<string, unknown> = {}

  const kunjunganConstraints: Record<string, unknown>[] = []

  if (kunjunganId) {
    kunjunganConstraints.push({ kunjungan_id: kunjunganId })
  }

  // Filter lokasi: kumpulkan ID kunjungan yang cocok untuk tiap filter lalu irisan
  const matchSets: string[][] = []

  if (kotaNama) {
    const kotas = await prisma.kota.findMany({
      where: { nama: kotaNama },
      select: { id: true },
    })
    const kunjungans = kotas.length
      ? await prisma.kunjungan.findMany({
          where: { kota_id: { in: kotas.map((k) => k.id) } },
          select: { id: true },
        })
      : []
    matchSets.push(kunjungans.map((k) => k.id))
  }

  if (kecamatanNama) {
    const kecamatans = await prisma.kecamatan.findMany({
      where: { nama: kecamatanNama },
      select: { id: true },
    })
    const kunjungans = kecamatans.length
      ? await prisma.kunjungan.findMany({
          where: { kecamatan_id: { in: kecamatans.map((k) => k.id) } },
          select: { id: true },
        })
      : []
    matchSets.push(kunjungans.map((k) => k.id))
  }

  if (kelurahanNama) {
    const kelurahans = await prisma.kelurahan.findMany({
      where: { nama: kelurahanNama },
      select: { id: true },
    })
    const kunjungans = kelurahans.length
      ? await prisma.kunjungan.findMany({
          where: { kelurahan_id: { in: kelurahans.map((k) => k.id) } },
          select: { id: true },
        })
      : []
    matchSets.push(kunjungans.map((k) => k.id))
  }

  if (matchSets.length) {
    const intersection = matchSets.reduce((acc, cur) =>
      acc.filter((x) => cur.includes(x))
    )
    kunjunganConstraints.push({ kunjungan_id: { in: intersection } })
  }

  if (kunjunganConstraints.length === 1) {
    where.kunjungan_id = kunjunganConstraints[0].kunjungan_id
  } else if (kunjunganConstraints.length > 1) {
    where.AND = kunjunganConstraints
  }

  if (search) {
    const searchOr = {
      OR: [
        { nama_kegiatan: { contains: search, mode: 'insensitive' as const } },
        { jenis_kegiatan: { contains: search, mode: 'insensitive' as const } },
        { tempat: { contains: search, mode: 'insensitive' as const } },
        { isi: { contains: search, mode: 'insensitive' as const } },
      ],
    }
    if (where.AND) {
      where.AND = [searchOr, ...(where.AND as Record<string, unknown>[])]
    } else {
      where.AND = [searchOr]
    }
  }

  const [data, total] = await Promise.all([
    prisma.kegiatan.findMany({
      where,
      include: {
        kunjungan: {
          include: {
            kelurahan: true,
            kecamatan: true,
            kota: true,
          },
        },
        dibuatOleh: { select: { name: true } },
      },
      orderBy: { tanggal: 'desc' },
      ...(hasPagination ? { skip: (page - 1) * limit, take: limit } : {}),
    }),
    prisma.kegiatan.count({ where }),
  ])

  const result = data.map((k) => ({
    id: k.id,
    jenis_kegiatan: k.jenis_kegiatan,
    kunjungan_id: k.kunjungan_id,
    isi: k.isi ?? '',
    hari: k.hari ?? '',
    tanggal: k.tanggal?.toISOString() ?? '',
    foto: (() => { try { const f = k.foto ?? ''; return f.startsWith('[') ? JSON.parse(f) : f } catch { return k.foto ?? '' } })(),
    nama_kegiatan: k.nama_kegiatan,
    link_gmaps: k.link_gmaps ?? '',
    lokasi: k.tempat ?? '',
    rt: k.rt ?? '',
    rw: k.rw ?? '',
    jumlah_peserta: k.jumlah_peserta ?? 0,
    catatan: k.catatan ?? '',
    kelurahan: k.kunjungan.kelurahan.nama,
    kecamatan: k.kunjungan.kecamatan.nama,
    kota: k.kunjungan.kota.nama,
    dibuat_oleh: k.dibuatOleh?.name ?? '',
  }))

  return NextResponse.json(hasPagination ? { data: result, total, page, limit } : result)
}

export async function POST(request: Request) {
  const body = await request.json()

  const fotoVal = Array.isArray(body.foto) ? JSON.stringify(body.foto) : (body.foto ?? '')

  const created = await prisma.kegiatan.create({
    data: {
      jenis_kegiatan: body.jenis_kegiatan ?? '',
      kunjungan_id: body.kunjungan_id,
      isi: body.isi ?? '',
      hari: body.hari ?? '',
      tanggal: body.tanggal ? new Date(body.tanggal) : null,
      foto: fotoVal,
      nama_kegiatan: body.nama_kegiatan,
      link_gmaps: body.link_gmaps ?? '',
      tempat: body.tempat ?? '',
      alamat: body.alamat ?? '',
      rt: body.rt ?? '',
      rw: body.rw ?? '',
      jumlah_peserta: body.jumlah_peserta ? parseInt(body.jumlah_peserta) : null,
      catatan: body.catatan ?? '',
      dibuat_oleh_id: body.dibuat_oleh_id ?? null,
    },
    include: {
      kunjungan: {
        include: { kelurahan: true, kecamatan: true, kota: true },
      },
    },
  })

  return NextResponse.json({
    id: created.id,
    jenis_kegiatan: created.jenis_kegiatan,
    kunjungan_id: created.kunjungan_id,
    isi: created.isi ?? '',
    hari: created.hari ?? '',
    tanggal: created.tanggal?.toISOString() ?? '',
    foto: (() => { try { const f = created.foto ?? ''; return f.startsWith('[') ? JSON.parse(f) : f } catch { return created.foto ?? '' } })(),
    nama_kegiatan: created.nama_kegiatan,
    link_gmaps: created.link_gmaps ?? '',
    lokasi: created.tempat ?? '',
    rt: created.rt ?? '',
    rw: created.rw ?? '',
    jumlah_peserta: created.jumlah_peserta ?? 0,
    catatan: created.catatan ?? '',
    kelurahan: created.kunjungan.kelurahan.nama,
    kecamatan: created.kunjungan.kecamatan.nama,
    kota: created.kunjungan.kota.nama,
  }, { status: 201 })
}
