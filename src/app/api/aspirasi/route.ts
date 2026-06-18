import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.aspirasis.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
      trackings: { orderBy: { created_at: 'asc' } },
    },
  })

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
    lampiran: a.lampiran as string[] ?? [],
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
    lokasi: a.alamat ?? '',
    trackings: a.trackings.map((t) => ({
      id: t.id,
      aspirasi_id: t.aspirasi_id,
      status: t.status,
      catatan: t.catatan ?? '',
      lampiran: t.lampiran as string[] ?? [],
      created_at: t.created_at.toISOString(),
    })),
  }))

  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json()

  let kotaId: string | undefined
  let kecamatanId: string | undefined
  let kelurahanId: string | undefined

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
      kota_id: kotaId,
      kecamatan_id: kecamatanId,
      kelurahan_id: kelurahanId,
      alamat: body.lokasi ?? body.alamat ?? '',
    },
  })

  await prisma.trackingAspirasi.create({
    data: {
      aspirasi_id: created.id,
      status: 'BELUM_DITINDAKLANJUTI',
    },
  })

  return NextResponse.json({
    id: created.id,
    id_laporan: created.id_laporan ?? '',
    nik: created.nik ?? '',
    sumber: created.sumber,
    deskripsi: created.deskripsi,
    status: created.status,
    pelapor_nama: created.pelapor_nama,
    pelapor_email: created.pelapor_email ?? '',
    pelapor_telepon: created.pelapor_telepon,
    lampiran: created.lampiran as string[] ?? [],
    kategori_usulan: created.kategori_usulan,
    jenis_usulan: created.jenis_usulan,
    jenis_reses: created.jenis_reses,
    tindak_lanjut: created.tindak_lanjut,
    tanggal_dibuat: created.tanggal_dibuat.toISOString(),
    created_at: created.created_at.toISOString(),
    updated_at: created.updated_at.toISOString(),
  }, { status: 201 })
}
