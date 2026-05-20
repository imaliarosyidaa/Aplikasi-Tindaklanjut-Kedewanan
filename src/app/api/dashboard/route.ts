import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { MASTER_WILAYAH } from '@/utils/masterWilayah'
import { dummyDashboardStats } from '@/data/dummy'

export async function GET() {
  try {
    const { data: kunjungan, error: kunjunganError } = await supabaseAdmin
      .from('kunjungan')
      .select('*')

    if (kunjunganError) throw new Error(kunjunganError.message)

    const { data: aspirasi, error: aspirasiError } = await supabaseAdmin
      .from('aspirasi')
      .select('*')

    if (aspirasiError) throw new Error(aspirasiError.message)

    const kunjunganData = kunjungan ?? []
    const aspirasiData = aspirasi ?? []

    const total_kelurahan = MASTER_WILAYAH.reduce(
      (sum, kec) => sum + kec.kelurahan.length,
      0
    )

    const kelurahan_dikunjungi = new Set(
      kunjunganData.map((k: { kelurahan: string }) => k.kelurahan)
    ).size

    const kelurahan_belum_dikunjungi = total_kelurahan - kelurahan_dikunjungi

    const bulanNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
    ]

    const kunjungan_per_bulan = bulanNames.map((bulan, i) => {
      const month = String(i + 1).padStart(2, '0')
      const jumlah = kunjunganData.filter((k: { tanggal: string }) =>
        k.tanggal?.startsWith(`2025-${month}`) ||
        k.tanggal?.startsWith(`2026-${month}`)
      ).length
      return { bulan, jumlah }
    })

    const aspirasi_per_bulan = bulanNames.map((bulan, i) => {
      const month = String(i + 1).padStart(2, '0')
      const jumlah = aspirasiData.filter((a: { created_at: string }) =>
        a.created_at?.startsWith(`2025-${month}`) ||
        a.created_at?.startsWith(`2026-${month}`)
      ).length
      return { bulan, jumlah }
    })

    const statusCounts: Record<string, number> = {}
    const sumberCounts: Record<string, number> = {}

    for (const a of aspirasiData) {
      const s = (a as { status: string }).status
      statusCounts[s] = (statusCounts[s] ?? 0) + 1
      const src = (a as { sumber: string }).sumber
      sumberCounts[src] = (sumberCounts[src] ?? 0) + 1
    }

    return NextResponse.json({
      total_kunjungan: kunjunganData.length,
      total_aspirasi: aspirasiData.length,
      kunjungan_per_bulan,
      aspirasi_per_bulan,
      aspirasi_per_status: Object.entries(statusCounts).map(([status, jumlah]) => ({ status, jumlah })),
      aspirasi_per_sumber: Object.entries(sumberCounts).map(([sumber, jumlah]) => ({ sumber, jumlah })),
      kelurahan_dikunjungi,
      kelurahan_belum_dikunjungi,
      total_kelurahan,
      kunjungan_per_kecamatan: MASTER_WILAYAH.map((kec) => {
        const kelurahanList = kec.kelurahan.map((k) => k.nama)
        const kelurahanDikunjungi = kunjunganData.filter((k: { kelurahan: string }) =>
          kelurahanList.includes(k.kelurahan)
        )
        const uniqueKelurahan = new Set(kelurahanDikunjungi.map((k: { kelurahan: string }) => k.kelurahan))
        return {
          kecamatan: kec.nama,
          jumlah_kunjungan: kelurahanDikunjungi.length,
          jumlah_kelurahan: kec.kelurahan.length,
          kelurahan_dikunjungi: uniqueKelurahan.size,
        }
      }),
    })
  } catch {
    return NextResponse.json(dummyDashboardStats)
  }
}
