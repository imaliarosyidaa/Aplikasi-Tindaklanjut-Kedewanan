import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    total_kunjungan,
    total_aspirasi,
    kunjungan_all,
    aspirasi_all,
    kecamatans,
    kelurahans,
    statusGroup,
    sumberGroup,
  ] = await Promise.all([
    prisma.kunjungan.count(),
    prisma.aspirasis.count(),
    prisma.kunjungan.findMany({
      select: { tanggal: true, kelurahan_id: true },
    }),
    prisma.aspirasis.findMany({
      select: { created_at: true, status: true, sumber: true },
    }),
    prisma.kecamatan.findMany({ select: { id: true, nama: true } }),
    prisma.kelurahan.findMany({ select: { id: true, kecamatan_id: true } }),
    prisma.aspirasis.groupBy({ by: ['status'], _count: { status: true } }),
    prisma.aspirasis.groupBy({ by: ['sumber'], _count: { sumber: true } }),
  ])

  const total_kelurahan = kelurahans.length

  const kelurahan_dikunjungi = new Set(
    kunjungan_all.map((k) => k.kelurahan_id)
  ).size

  const kelurahan_belum_dikunjungi = total_kelurahan - kelurahan_dikunjungi

  const bulanNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]

  const kunjungan_per_bulan = bulanNames.map((bulan, i) => {
    const month = String(i + 1).padStart(2, '0')
    const jumlah = kunjungan_all.filter((k) => {
      const d = k.tanggal.toISOString()
      return d.startsWith(`2025-${month}`) || d.startsWith(`2026-${month}`)
    }).length
    return { bulan, jumlah }
  })

  const aspirasi_per_bulan = bulanNames.map((bulan, i) => {
    const month = String(i + 1).padStart(2, '0')
    const jumlah = aspirasi_all.filter((a) => {
      const d = a.created_at.toISOString()
      return d.startsWith(`2025-${month}`) || d.startsWith(`2026-${month}`)
    }).length
    return { bulan, jumlah }
  })

  const aspirasi_per_status = statusGroup.map((g) => ({
    status: g.status,
    jumlah: g._count.status,
  }))

  const aspirasi_per_sumber = sumberGroup.map((g) => ({
    sumber: g.sumber,
    jumlah: g._count.sumber,
  }))

  const kunjungan_per_kecamatan = kecamatans.map((kec) => {
    const kelIds = kelurahans
      .filter((kel) => kel.kecamatan_id === kec.id)
      .map((kel) => kel.id)
    const uniqueKel = new Set(
      kunjungan_all
        .filter((k) => kelIds.includes(k.kelurahan_id))
        .map((k) => k.kelurahan_id)
    )
    return {
      kecamatan: kec.nama,
      jumlah_kunjungan: kunjungan_all.filter((k) =>
        kelIds.includes(k.kelurahan_id)
      ).length,
      jumlah_kelurahan: kelIds.length,
      kelurahan_dikunjungi: uniqueKel.size,
    }
  })

  return NextResponse.json({
    total_kunjungan,
    total_aspirasi,
    kunjungan_per_bulan,
    aspirasi_per_bulan,
    aspirasi_per_status,
    aspirasi_per_sumber,
    kelurahan_dikunjungi,
    kelurahan_belum_dikunjungi,
    total_kelurahan,
    kunjungan_per_kecamatan,
  })
}
