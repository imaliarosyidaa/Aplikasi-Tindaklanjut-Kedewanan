import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

interface CsvRow {
  kota: string
  kecamatan: string
  kelurahan: string
}

function parseCsv(): CsvRow[] {
  const csv = readFileSync(join(__dirname, 'Daftar_Kota_Kecamatan_Kelurahan_DKI_Jakarta.csv'), 'utf-8')
  const lines = csv.trim().split('\n')
  return lines.slice(1).map((line) => {
    const [kota, kecamatan, kelurahan] = line.split(',')
    return { kota: kota.trim(), kecamatan: kecamatan.trim(), kelurahan: kelurahan.trim() }
  })
}

async function main() {
  console.log('Seeding...')

  await prisma.kegiatan.deleteMany()
  await prisma.trackingAspirasi.deleteMany()
  await prisma.aspirasis.deleteMany()
  await prisma.relawan.deleteMany()
  await prisma.kunjungan.deleteMany()
  await prisma.kelurahan.deleteMany()
  await prisma.kecamatan.deleteMany()
  await prisma.kota.deleteMany()
  await prisma.user.deleteMany()

  // ──────────────────────────────────────────────
  // 1. Parse CSV → Kota / Kecamatan / Kelurahan
  // ──────────────────────────────────────────────
  const rows = parseCsv()
  const kotaSet = new Set(rows.map((r) => r.kota))
  const kotaList = Array.from(kotaSet)

  const kotaMap = new Map<string, string>()
  for (const nama of kotaList) {
    const k = await prisma.kota.create({ data: { nama } })
    kotaMap.set(nama, k.id)
  }
  console.log(`  ${kotaList.length} kota created`)

  const kecamatanMap = new Map<string, string>()
  const kecamatanSeen = new Set<string>()
  for (const r of rows) {
    const key = `${r.kota}|${r.kecamatan}`
    if (!kecamatanSeen.has(key)) {
      kecamatanSeen.add(key)
      const k = await prisma.kecamatan.create({
        data: { nama: r.kecamatan, kota_id: kotaMap.get(r.kota)! },
      })
      kecamatanMap.set(r.kecamatan, k.id)
    }
  }
  console.log(`  ${kecamatanMap.size} kecamatan created`)

  const kelurahanMap = new Map<string, string>()
  for (const r of rows) {
    const k = await prisma.kelurahan.create({
      data: { nama: r.kelurahan, kecamatan_id: kecamatanMap.get(r.kecamatan)! },
    })
    kelurahanMap.set(r.kelurahan, k.id)
  }
  console.log(`  ${rows.length} kelurahan created`)

  // ──────────────────────────────────────────────
  // 2. Users
  // ──────────────────────────────────────────────
  await prisma.user.create({
    data: { id: randomUUID(), username: 'admin', email: 'admin@dprd-jaksel.go.id', password: 'admin123', name: 'Admin DPRD Jakarta Selatan', role: 'admin' },
  })
  await prisma.user.create({
    data: { id: randomUUID(), username: 'superadmin', email: 'superadmin@dprd-jaksel.go.id', password: 'superadmin123', name: 'Super Admin', role: 'admin' },
  })
  console.log('  2 users created')

  // ──────────────────────────────────────────────
  // 3. Kunjungan
  // ──────────────────────────────────────────────
  const kunjunganInput = [
    { id: randomUUID(), tanggal: new Date('2026-01-15'), jam: '09:30', jalan: 'Jl. Cipete Raya No. 10', kota: 'Jakarta Selatan', kecamatan: 'Mampang Prapatan', kelurahan: 'Kuningan Barat' },
    { id: randomUUID(), tanggal: new Date('2026-01-20'), jam: '10:00', jalan: 'Jl. Gandaria Tengah', kota: 'Jakarta Selatan', kecamatan: 'Mampang Prapatan', kelurahan: 'Mampang Prapatan' },
    { id: randomUUID(), tanggal: new Date('2026-02-05'), jam: '08:45', jalan: 'Jl. Cipulir Raya', kota: 'Jakarta Selatan', kecamatan: 'Tebet', kelurahan: 'Manggarai' },
    { id: randomUUID(), tanggal: new Date('2026-02-18'), jam: '13:15', jalan: 'Jl. Kalibata Timur', kota: 'Jakarta Selatan', kecamatan: 'Pancoran', kelurahan: 'Kalibata' },
    { id: randomUUID(), tanggal: new Date('2026-03-02'), jam: '09:00', jalan: 'Jl. Pejaten Raya', kota: 'Jakarta Selatan', kecamatan: 'Pasar Minggu', kelurahan: 'Pejaten Barat' },
    { id: randomUUID(), tanggal: new Date('2026-03-10'), jam: '10:30', jalan: 'Jl. Bintaro Raya', kota: 'Jakarta Selatan', kecamatan: 'Pasar Minggu', kelurahan: 'Cilandak Timur' },
    { id: randomUUID(), tanggal: new Date('2026-04-01'), jam: '11:00', jalan: 'Jl. Duren Tiga Raya', kota: 'Jakarta Selatan', kecamatan: 'Pancoran', kelurahan: 'Duren Tiga' },
    { id: randomUUID(), tanggal: new Date('2026-04-20'), jam: '08:30', jalan: 'Jl. Ragunan Raya', kota: 'Jakarta Selatan', kecamatan: 'Pasar Minggu', kelurahan: 'Ragunan' },
    { id: randomUUID(), tanggal: new Date('2026-05-05'), jam: '09:15', jalan: 'Jl. Petukangan Raya', kota: 'Jakarta Selatan', kecamatan: 'Jagakarsa', kelurahan: 'Ciganjur' },
    { id: randomUUID(), tanggal: new Date('2026-05-12'), jam: '14:00', jalan: 'Jl. Senayan Raya', kota: 'Jakarta Selatan', kecamatan: 'Mampang Prapatan', kelurahan: 'Pela Mampang' },
  ]

  const kunjunganRecords = await Promise.all(
    kunjunganInput.map((k) =>
      prisma.kunjungan.create({
        data: {
          id: k.id,
          tanggal: k.tanggal,
          jam: k.jam,
          jalan: k.jalan,
          kota_id: kotaMap.get(k.kota)!,
          kecamatan_id: kecamatanMap.get(k.kecamatan)!,
          kelurahan_id: kelurahanMap.get(k.kelurahan)!,
        },
      })
    )
  )

  const kunjunganByJalan = new Map(kunjunganRecords.map((k) => [k.jalan, k]))
  console.log(`  ${kunjunganRecords.length} kunjungan created`)

  // ──────────────────────────────────────────────
  // 4. Aspirasi
  // ──────────────────────────────────────────────
  const aspirasiData = [
    { id: randomUUID(), sumber: 'LEMBAR_ASPIRASI_RESES' as const, deskripsi: 'Warga mengusulkan perbaikan drainase di RW 03 Kelurahan Bukit Duri karena sering banjir saat hujan deras.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ahmad Fauzi', pelapor_email: 'ahmad.fauzi@email.com', pelapor_telepon: '081234567890', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15'), kecamatan: 'Tebet', kelurahan: 'Bukit Duri', alamat: 'RW 03 Kelurahan Bukit Duri' },
    { id: randomUUID(), sumber: 'LEMBAR_ASPIRASI_SOSPERDA' as const, deskripsi: 'Usulan pembangunan posyandu untuk melayani balita dan lansia di Kelurahan Bangka.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Siti Nurhaliza', pelapor_email: 'siti.nur@email.com', pelapor_telepon: '081234567891', kategori_usulan: 'Kesehatan', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-01-20'), catatan_tindak_lanjut: 'Sedang dalam proses koordinasi dengan Dinas Kesehatan Jakarta Selatan.', kecamatan: 'Mampang Prapatan', kelurahan: 'Bangka', alamat: 'Kelurahan Bangka' },
    { id: randomUUID(), sumber: 'ASPIRASI_PROPOSAL_LANGSUNG' as const, deskripsi: 'Pengajuan bantuan modal usaha untuk kelompok UMKM binaan Kelurahan Pejaten Barat sebanyak 50 orang.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Bambang Supriyadi', pelapor_email: 'bambang@email.com', pelapor_telepon: '081234567892', kategori_usulan: 'Ekonomi', jenis_usulan: 'Bantuan Modal', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-02-05'), catatan_tindak_lanjut: 'Bantuan modal sudah disalurkan melalui Dinas Koperasi dan UMKM DKI Jakarta.', kecamatan: 'Pasar Minggu', kelurahan: 'Pejaten Barat', alamat: 'Kelurahan Pejaten Barat' },
    { id: randomUUID(), sumber: 'KOORDINASI_DINAS_TERKAIT' as const, deskripsi: 'Koordinasi dengan Dinas Pendidikan terkait renovasi 3 ruang kelas SDN Kalibata 01 yang rusak berat.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Dewi Sartika', pelapor_email: 'dewi.sartika@email.com', pelapor_telepon: '081234567893', kategori_usulan: 'Pendidikan', jenis_usulan: 'Renovasi', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-02-20'), catatan_tindak_lanjut: 'Surat rekomendasi sudah dikirim ke Dinas Pendidikan, menunggu jadwal survei.', kecamatan: 'Pancoran', kelurahan: 'Kalibata', alamat: 'SDN Kalibata 01' },
    { id: randomUUID(), sumber: 'USULAN_MUSRENBANG_DEWAN' as const, deskripsi: 'Usulan pembangunan jalan lingkungan di RW 05 Kelurahan Jagakarsa yang masih berupa tanah.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Hasan Basri', pelapor_email: 'hasan.basri@email.com', pelapor_telepon: '081234567894', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-03-02'), catatan_tindak_lanjut: 'Jalan sudah diaspal pada bulan Maret 2026 oleh Dinas Bina Marga DKI Jakarta.', kecamatan: 'Jagakarsa', kelurahan: 'Jagakarsa', alamat: 'RW 05 Kelurahan Jagakarsa' },
    { id: randomUUID(), sumber: 'CALL_CENTER' as const, deskripsi: 'Laporan warga tentang tiang listrik miring di Jl. Raya Lenteng Agung yang membahayakan pengguna jalan.', status: 'TIDAK_BISA_DITINDAKLANJUTI' as const, pelapor_nama: 'Rudi Hartono', pelapor_email: '', pelapor_telepon: '081234567895', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Tidak bisa ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15'), kecamatan: 'Jagakarsa', kelurahan: 'Lenteng Agung', alamat: 'Jl. Raya Lenteng Agung' },
    { id: randomUUID(), sumber: 'LEMBAR_ASPIRASI_RESES' as const, deskripsi: 'Permohonan penerangan jalan umum (PJU) di Gang H. Saidi, Kelurahan Duren Tiga yang gelap gulita.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Mulyadi', pelapor_email: 'mulyadi@email.com', pelapor_telepon: '081234567896', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-04-01'), catatan_tindak_lanjut: 'Surat menyurat dengan Dinas Bina Marga sudah dilakukan, menunggu realisasi pemasangan.', kecamatan: 'Pancoran', kelurahan: 'Duren Tiga', alamat: 'Gang H. Saidi, Duren Tiga' },
    { id: randomUUID(), sumber: 'KOORDINASI_DINAS_TERKAIT' as const, deskripsi: 'Koordinasi penanganan sampah di TPS liar Kelurahan Ragunan dengan Dinas Lingkungan Hidup.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ani Susanti', pelapor_email: 'ani.susanti@email.com', pelapor_telepon: '081234567897', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15'), kecamatan: 'Pasar Minggu', kelurahan: 'Ragunan', alamat: 'TPS liar Kelurahan Ragunan' },
    { id: randomUUID(), sumber: 'CALL_CENTER' as const, deskripsi: 'Pengaduan suara bising dari gudang proyek di dekat pemukiman warga Kelurahan Tebet Timur.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Fajar Ramadhan', pelapor_email: 'fajar@email.com', pelapor_telepon: '081234567898', kategori_usulan: 'Lingkungan', jenis_usulan: 'Pengaduan', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-05-05'), catatan_tindak_lanjut: 'Pihak pengelola sudah diberikan teguran dan diminta membatasi jam operasional.', kecamatan: 'Tebet', kelurahan: 'Tebet Timur', alamat: 'Pemukiman warga Kelurahan Tebet Timur' },
    { id: randomUUID(), sumber: 'USULAN_MUSRENBANG_DEWAN' as const, deskripsi: 'Usulan pembangunan taman bermain anak di area RPTRA Kelurahan Srengseng Sawah untuk fasilitas publik.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ratna Dewi', pelapor_email: 'ratna.dewi@email.com', pelapor_telepon: '081234567899', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15'), kecamatan: 'Jagakarsa', kelurahan: 'Srengseng Sawah', alamat: 'Area RPTRA Kelurahan Srengseng Sawah' },
  ]

  await Promise.all(
    aspirasiData.map(({ kecamatan, kelurahan, alamat, catatan_tindak_lanjut, ...a }) =>
      prisma.aspirasis.create({
        data: {
          ...a,
          kota_id: kotaMap.get('Jakarta Selatan')!,
          kecamatan_id: kecamatanMap.get(kecamatan)!,
          kelurahan_id: kelurahanMap.get(kelurahan)!,
          alamat,
        },
      })
    )
  )
  console.log(`  ${aspirasiData.length} aspirasi created`)

  // ──────────────────────────────────────────────
  // 4b. Tracking Aspirasi
  // ──────────────────────────────────────────────
  const trackingData: { aspirasi_id: string; status: string; catatan?: string }[] = []
  for (const a of aspirasiData) {
    if (a.status === 'BELUM_DITINDAKLANJUTI') {
      trackingData.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI' })
    } else if (a.status === 'SEDANG_DITINDAKLANJUTI') {
      trackingData.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI' })
      trackingData.push({ aspirasi_id: a.id, status: 'SEDANG_DITINDAKLANJUTI', catatan: a.catatan_tindak_lanjut })
    } else if (a.status === 'SUDAH_DITINDAKLANJUTI') {
      trackingData.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI' })
      trackingData.push({ aspirasi_id: a.id, status: 'SEDANG_DITINDAKLANJUTI', catatan: a.catatan_tindak_lanjut })
      trackingData.push({ aspirasi_id: a.id, status: 'SUDAH_DITINDAKLANJUTI', catatan: a.catatan_tindak_lanjut })
    } else if (a.status === 'TIDAK_BISA_DITINDAKLANJUTI') {
      trackingData.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI' })
      trackingData.push({ aspirasi_id: a.id, status: 'SEDANG_DITINDAKLANJUTI' })
      trackingData.push({ aspirasi_id: a.id, status: 'TIDAK_BISA_DITINDAKLANJUTI', catatan: a.catatan_tindak_lanjut })
    }
  }

  await prisma.trackingAspirasi.createMany({ data: trackingData })
  console.log(`  ${trackingData.length} tracking aspirasi created`)

  // ──────────────────────────────────────────────
  // 5. Relawan
  // ──────────────────────────────────────────────
  const relawanData = [
    { id: randomUUID(), nik: '3174011234560001', nama: 'Ahmad Fauzi', no_telepon: '081234567890', jenis_kelamin: 'LAKI_LAKI' as const, alamat: 'Jl. Bukit Duri Selatan RT 05 RW 05', posisi: 'KOORDINATOR_RW' as const, kecamatan: 'Tebet', kelurahan: 'Bukit Duri' },
    { id: randomUUID(), nik: '3174011234560002', nama: 'Siti Nurhaliza', no_telepon: '081234567891', jenis_kelamin: 'PEREMPUAN' as const, alamat: 'Jl. Bangka Raya RT 02 RW 03', posisi: 'KOORDINATOR_KELURAHAN' as const, kecamatan: 'Mampang Prapatan', kelurahan: 'Bangka' },
    { id: randomUUID(), nik: '3174011234560003', nama: 'Bambang Supriyadi', no_telepon: '081234567892', jenis_kelamin: 'LAKI_LAKI' as const, alamat: 'Jl. Pejaten Barat RT 01 RW 02', posisi: 'FKDM' as const, kecamatan: 'Pasar Minggu', kelurahan: 'Pejaten Barat' },
  ]

  await Promise.all(
    relawanData.map(({ kecamatan, kelurahan, ...r }) =>
      prisma.relawan.create({
        data: {
          ...r,
          kota_id: kotaMap.get('Jakarta Selatan')!,
          kecamatan_id: kecamatanMap.get(kecamatan)!,
          kelurahan_id: kelurahanMap.get(kelurahan)!,
        },
      })
    )
  )
  console.log(`  ${relawanData.length} relawan created`)

  // ──────────────────────────────────────────────
  // 6. Kegiatan
  // ──────────────────────────────────────────────
  const kegiatanData = [
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipete Raya No. 10', isi: 'Sosialisasi program kesehatan lingkungan bersama warga RW 05', hari: 'Senin', tanggal: new Date('2026-03-10'), tempat: 'Jl. Bukit Duri Selatan No. 12, Bukit Duri', foto: '', jenis_kegiatan: 'Sosialisasi', nama_kegiatan: 'Sosialisasi Kesehatan Lingkungan', link_gmaps: 'https://maps.google.com/?q=Bukit+Duri+Selatan+12', rt: '05', rw: '05', jumlah_peserta: 45, catatan: 'Kegiatan berjalan lancar, warga antusias mengikuti' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipete Raya No. 10', isi: 'Monitoring pembangunan drainase lingkungan setelah reses', hari: 'Rabu', tanggal: new Date('2026-04-15'), tempat: 'RW 03, Bukit Duri', foto: '', jenis_kegiatan: 'Monitoring', nama_kegiatan: 'Monitoring Drainase Lingkungan', link_gmaps: 'https://maps.google.com/?q=RW+03+Bukit+Duri', rt: '03', rw: '03', jumlah_peserta: 12, catatan: 'Progres pembangunan drainase mencapai 70%' },
  ]

  await Promise.all(
    kegiatanData.map(({ kunjungan_jalan, ...k }) =>
      prisma.kegiatan.create({
        data: {
          ...k,
          kunjungan_id: kunjunganByJalan.get(kunjungan_jalan)!.id,
        },
      })
    )
  )
  console.log(`  ${kegiatanData.length} kegiatan created`)

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
