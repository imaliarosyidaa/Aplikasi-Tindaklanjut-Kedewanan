import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { MASTER_WILAYAH } from '@/utils/masterWilayah'

export async function GET() {
  const [kunjungan, aspirasi, kecamatans, kelurahans] = await Promise.all([
    prisma.kunjungan.findMany({
      include: { kelurahan: { include: { kecamatan: true } } },
    }),
    prisma.aspirasis.findMany(),
    prisma.kecamatan.findMany(),
    prisma.kelurahan.findMany(),
  ])

  const total_kelurahan = kelurahans.length

  const kelurahan_dikunjungi = new Set(
    kunjungan.map((k) => k.kelurahan_id)
  ).size

  const kelurahan_belum_dikunjungi = total_kelurahan - kelurahan_dikunjungi

  const bulanNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]

  const kunjungan_per_bulan = bulanNames.map((bulan, i) => {
    const month = String(i + 1).padStart(2, '0')
    const jumlah = kunjungan.filter((k) => {
      const d = k.tanggal.toISOString()
      return d.startsWith(`2025-${month}`) || d.startsWith(`2026-${month}`)
    }).length
    return { bulan, jumlah }
  })

  const aspirasi_per_bulan = bulanNames.map((bulan, i) => {
    const month = String(i + 1).padStart(2, '0')
    const jumlah = aspirasi.filter((a) => {
      const d = a.created_at.toISOString()
      return d.startsWith(`2025-${month}`) || d.startsWith(`2026-${month}`)
    }).length
    return { bulan, jumlah }
  })

  const statusCounts: Record<string, number> = {}
  const sumberCounts: Record<string, number> = {}

  for (const a of aspirasi) {
    statusCounts[a.status] = (statusCounts[a.status] ?? 0) + 1
    sumberCounts[a.sumber] = (sumberCounts[a.sumber] ?? 0) + 1
  }

  const kunjungan_per_kecamatan = kecamatans.map((kec) => {
    const kelList = kelurahans.filter((kel) => kel.kecamatan_id === kec.id)
    const kelDikunjungi = kunjungan.filter((k) =>
      kelList.some((kel) => kel.id === k.kelurahan_id)
    )
    const uniqueKel = new Set(kelDikunjungi.map((k) => k.kelurahan_id))
    return {
      kecamatan: kec.nama,
      jumlah_kunjungan: kelDikunjungi.length,
      jumlah_kelurahan: kelList.length,
      kelurahan_dikunjungi: uniqueKel.size,
    }
  })

  return NextResponse.json({
    total_kunjungan: kunjungan.length,
    total_aspirasi: aspirasi.length,
    kunjungan_per_bulan,
    aspirasi_per_bulan,
    aspirasi_per_status: Object.entries(statusCounts).map(([status, jumlah]) => ({ status, jumlah })),
    aspirasi_per_sumber: Object.entries(sumberCounts).map(([sumber, jumlah]) => ({ sumber, jumlah })),
    kelurahan_dikunjungi,
    kelurahan_belum_dikunjungi,
    total_kelurahan,
    kunjungan_per_kecamatan,
  })
}
