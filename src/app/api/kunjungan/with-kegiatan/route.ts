import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()

  const [kota, kecamatan, kelurahan] = await Promise.all([
    prisma.kota.findFirstOrThrow({ where: { nama: body.kota ?? 'Jakarta Selatan' } }),
    prisma.kecamatan.findFirstOrThrow({ where: { nama: body.kecamatan } }),
    prisma.kelurahan.findFirstOrThrow({ where: { nama: body.kelurahan } }),
  ])

  const result = await prisma.$transaction(async (tx) => {
    const kunjungan = await tx.kunjungan.create({
      data: {
        tanggal: new Date(body.tanggal),
        jam: body.jam,
        jalan: body.jalan,
        kota_id: kota.id,
        kecamatan_id: kecamatan.id,
        kelurahan_id: kelurahan.id,
        link_gmaps: body.link_gmaps ?? '',
      },
    })

    const kegiatan = await tx.kegiatan.create({
      data: {
        jenis_kegiatan: body.jenis_kegiatan ?? '',
        kunjungan_id: kunjungan.id,
        isi: body.isi ?? '',
        hari: body.hari ?? '',
        tanggal: body.tanggal ? new Date(body.tanggal) : null,
        foto: body.foto ?? '',
        nama_kegiatan: body.nama_kegiatan,
        link_gmaps: body.link_gmaps ?? '',
        tempat: body.tempat ?? '',
        alamat: body.alamat ?? '',
        rt: body.rt ?? '',
        rw: body.rw ?? '',
        jumlah_peserta: body.jumlah_peserta ? parseInt(body.jumlah_peserta) : null,
        catatan: body.catatan ?? '',
      },
      include: {
        kunjungan: {
          include: { kelurahan: true, kecamatan: true, kota: true },
        },
      },
    })

    return kegiatan
  })

  return NextResponse.json({
    id: result.id,
    jenis_kegiatan: result.jenis_kegiatan,
    kunjungan_id: result.kunjungan_id,
    isi: result.isi ?? '',
    hari: result.hari ?? '',
    tanggal: result.tanggal?.toISOString() ?? '',
    foto: result.foto ?? '',
    nama_kegiatan: result.nama_kegiatan,
    link_gmaps: result.link_gmaps ?? '',
    lokasi: result.tempat ?? '',
    rt: result.rt ?? '',
    rw: result.rw ?? '',
    jumlah_peserta: result.jumlah_peserta ?? 0,
    catatan: result.catatan ?? '',
    kelurahan: result.kunjungan.kelurahan.nama,
    kecamatan: result.kunjungan.kecamatan.nama,
    kota: result.kunjungan.kota.nama,
  }, { status: 201 })
}
