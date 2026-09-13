import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getDataScope, dprdFilter } from '@/lib/scoping'

export async function GET(request: NextRequest) {
  const scope = await getDataScope()
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  const hasPagination = pageParam !== null
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')))
  const search = searchParams.get('search')?.trim()
  const sumber = searchParams.get('sumber')
  const status = searchParams.get('status')
  const kotaNama = searchParams.get('kota')
  const kecamatanNama = searchParams.get('kecamatan')
  const kelurahanNama = searchParams.get('kelurahan')

  const where: Record<string, unknown> = scope.userId ? { ...dprdFilter(scope) } : {}

  if (sumber) where.sumber = sumber
  if (status) where.status = status
  if (kotaNama) {
    const kotas = await prisma.kota.findMany({
      where: { nama: kotaNama },
      select: { id: true },
    })
    where.kota_id = kotas.length ? { in: kotas.map((k) => k.id) } : { in: [] }
  }
  if (kecamatanNama) {
    const kecamatans = await prisma.kecamatan.findMany({
      where: { nama: kecamatanNama },
      select: { id: true },
    })
    where.kecamatan_id = kecamatans.length ? { in: kecamatans.map((k) => k.id) } : { in: [] }
  }
  if (kelurahanNama) {
    const kelurahans = await prisma.kelurahan.findMany({
      where: { nama: kelurahanNama },
      select: { id: true },
    })
    where.kelurahan_id = kelurahans.length ? { in: kelurahans.map((k) => k.id) } : { in: [] }
  }
  if (search) {
    const mode = { mode: 'insensitive' as const }
    where.OR = [
      { pelapor_nama: { contains: search, ...mode } },
      { pelapor_telepon: { contains: search } },
      { id_laporan: { contains: search, ...mode } },
      { kota: { is: { nama: { contains: search, ...mode } } } },
      { kecamatan: { is: { nama: { contains: search, ...mode } } } },
      { kelurahan: { is: { nama: { contains: search, ...mode } } } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.aspirasis.findMany({
      where,
      orderBy: [{ status: 'asc' }, { created_at: 'desc' }],
      ...(hasPagination ? { skip: (page - 1) * limit, take: limit } : {}),
      include: {
        kota: true,
        kecamatan: true,
        kelurahan: true,
        dewan: true,
        trackings: {
          orderBy: { created_at: 'asc' },
          include: { diverifikasiOleh: true },
        },
      },
    }),
    prisma.aspirasis.count({ where }),
  ])

  const result = data.map((a) => ({
    id: a.id,
    id_laporan: a.id_laporan ?? '',
    nik: a.nik ?? '',
    sumber: a.sumber,
    deskripsi: a.deskripsi,
    status: a.status,
    pelapor_nama: a.pelapor_nama,
    pelapor_email: a.pelapor_email ?? '',
    pelapor_telepon: a.pelapor_telepon,
    lampiran: (Array.isArray(a.lampiran)
      ? a.lampiran.map((f: unknown) => (typeof f === 'string' ? f : ((f as Record<string, unknown>).base64 ?? '')))
      : []) as string[],
    kategori_usulan: a.kategori_usulan,
    jenis_usulan: a.jenis_usulan,
    jenis_reses: a.jenis_reses,
    tindak_lanjut: a.tindak_lanjut,
    tanggal_dibuat: a.tanggal_dibuat.toISOString(),
    created_at: a.created_at.toISOString(),
    updated_at: a.updated_at.toISOString(),
    kota: a.kota?.nama ?? '',
    kecamatan: a.kecamatan?.nama ?? '',
    kelurahan: a.kelurahan?.nama ?? '',
    master_dewan: a.master_dewan ?? '',
    dewan: a.dewan?.name ?? '',
    lokasi: a.alamat ?? '',
    rt: a.rt ?? '',
    rw: a.rw ?? '',
    trackings: a.trackings.map((t) => ({
      id: t.id,
      aspirasi_id: t.aspirasi_id,
      status: t.status,
      catatan: t.catatan ?? '',
      lampiran: (Array.isArray(t.lampiran)
        ? t.lampiran.map((f: unknown) => (typeof f === 'string' ? f : ((f as Record<string, unknown>).base64 ?? '')))
        : []) as string[],
      created_at: t.created_at.toISOString(),
      diverifikasi_oleh_id: t.diverifikasiOleh?.id ?? '',
      diverifikasi_oleh_nama: t.diverifikasiOleh?.name ?? '',
    })),
  }))

  return NextResponse.json(hasPagination ? { data: result, total, page, limit } : result)
}

export async function POST(request: Request) {
  const body = await request.json()

  let kotaId: string | undefined
  let kecamatanId: string | undefined
  let kelurahanId: string | undefined
  let masterDewan: string | null = null

  if (body.master_dewan) {
    const dprd = await prisma.dprd.findUnique({ where: { id: body.master_dewan } })
    if (dprd) masterDewan = dprd.id
  }

  if (body.kota) {
    const kota = await prisma.kota.findFirst({ where: { nama: body.kota } })
    if (kota) kotaId = kota.id
  }
  if (body.kecamatan) {
    const kec = await prisma.kecamatan.findFirst({ where: { nama: body.kecamatan } })
    if (kec) kecamatanId = kec.id
  }
  if (body.kelurahan) {
    const kel = await prisma.kelurahan.findFirst({ where: { nama: body.kelurahan } })
    if (kel) kelurahanId = kel.id
  }

  const created = await prisma.aspirasis.create({
    data: {
      nik: body.nik ?? '',
      sumber: body.sumber,
      deskripsi: body.deskripsi,
      status: 'BELUM_DITINDAKLANJUTI',
      pelapor_nama: body.pelapor_nama,
      pelapor_email: body.pelapor_email ?? '',
      pelapor_telepon: body.pelapor_telepon ?? '',
      lampiran: body.lampiran ?? [],
      kategori_usulan: body.kategori_usulan ?? '',
      jenis_usulan: body.jenis_usulan ?? '',
      jenis_reses: body.jenis_reses ?? '',
      id_laporan: body.id_laporan ?? '',
      tindak_lanjut: 'Belum ditindaklanjuti',
      tanggal_dibuat: new Date(),
      kota: {
        connect: {
          id: kotaId ?? '',
        },
      },
      kecamatan: {
        connect: {
          id: kecamatanId ?? '',
        },
      },
      kelurahan: {
        connect: {
          id: kelurahanId ?? '',
        },
      },
      alamat: body.lokasi ?? body.alamat ?? '',
      rt: body.rt ?? '',
      rw: body.rw ?? '',
    },
  })

  if (masterDewan) {
    await prisma.$executeRaw`UPDATE aspirasis SET master_dewan = ${masterDewan}::uuid WHERE id = ${created.id}::uuid`
  }

  await prisma.trackingAspirasi.create({
    data: {
      aspirasi_id: created.id,
      status: 'BELUM_DITINDAKLANJUTI',
    },
  })

  return NextResponse.json(
    {
      id: created.id,
      id_laporan: created.id_laporan ?? '',
      nik: created.nik ?? '',
      sumber: created.sumber,
      deskripsi: created.deskripsi,
      status: created.status,
      pelapor_nama: created.pelapor_nama,
      pelapor_email: created.pelapor_email ?? '',
      pelapor_telepon: created.pelapor_telepon,
      lampiran: (Array.isArray(created.lampiran)
        ? created.lampiran.map((f: unknown) =>
            typeof f === 'string' ? f : ((f as Record<string, unknown>).base64 ?? ''),
          )
        : []) as string[],
      kategori_usulan: created.kategori_usulan,
      jenis_usulan: created.jenis_usulan,
      jenis_reses: created.jenis_reses,
      tindak_lanjut: created.tindak_lanjut,
      master_dewan: created.master_dewan ?? '',
      tanggal_dibuat: created.tanggal_dibuat.toISOString(),
      created_at: created.created_at.toISOString(),
      updated_at: created.updated_at.toISOString(),
    },
    { status: 201 },
  )
}
