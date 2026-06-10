import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const data = await prisma.aspirasi.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  const result = data.map((a) => ({
    id: a.id,
    nik: a.nik ?? '',
    sumber: a.sumber,
    deskripsi: a.deskripsi,
    status: a.status,
    pelapor_nama: a.pelapor_nama,
    pelapor_email: a.pelapor_email ?? '',
    pelapor_telepon: a.pelapor_telepon,
    lampiran: a.lampiran as string[] ?? [],
    bukti_tindak_lanjut: a.bukti_tindak_lanjut as string[] ?? [],
    catatan_tindak_lanjut: a.catatan_tindak_lanjut ?? '',
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

  const created = await prisma.aspirasi.create({
    data: {
      nik: body.nik ?? '',
      sumber: body.sumber,
      deskripsi: body.deskripsi,
      status: 'BELUM_DITINDAKLANJUTI',
      pelapor_nama: body.pelapor_nama,
      pelapor_email: body.pelapor_email ?? '',
      pelapor_telepon: body.pelapor_telepon ?? '',
      lampiran: body.lampiran ?? [],
      bukti_tindak_lanjut: [],
      catatan_tindak_lanjut: '',
      kategori_usulan: body.kategori_usulan ?? '',
      jenis_usulan: body.jenis_usulan ?? '',
      jenis_reses: body.jenis_reses ?? '',
      tindak_lanjut: 'Belum ditindaklanjuti',
      tanggal_dibuat: new Date(),
      kota_id: kotaId,
      kecamatan_id: kecamatanId,
      kelurahan_id: kelurahanId,
      alamat: body.lokasi ?? body.alamat ?? '',
    },
    include: {
      kota: true,
      kecamatan: true,
      kelurahan: true,
    },
  })

  return NextResponse.json({
    id: created.id,
    nik: created.nik ?? '',
    sumber: created.sumber,
    deskripsi: created.deskripsi,
    status: created.status,
    pelapor_nama: created.pelapor_nama,
    pelapor_email: created.pelapor_email ?? '',
    pelapor_telepon: created.pelapor_telepon,
    lampiran: created.lampiran as string[] ?? [],
    bukti_tindak_lanjut: created.bukti_tindak_lanjut as string[] ?? [],
    catatan_tindak_lanjut: created.catatan_tindak_lanjut ?? '',
    kategori_usulan: created.kategori_usulan,
    jenis_usulan: created.jenis_usulan,
    jenis_reses: created.jenis_reses,
    tindak_lanjut: created.tindak_lanjut,
    tanggal_dibuat: created.tanggal_dibuat.toISOString(),
    created_at: created.created_at.toISOString(),
    updated_at: created.updated_at.toISOString(),
    kota: created.kota?.nama ?? '',
    kecamatan: created.kecamatan?.nama ?? '',
    kelurahan: created.kelurahan?.nama ?? '',
    lokasi: created.alamat ?? '',
  }, { status: 201 })
}
