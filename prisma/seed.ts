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
  await prisma.aspirasi.deleteMany()
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
    aspirasiData.map(({ kecamatan, kelurahan, alamat, ...a }) =>
      prisma.aspirasi.create({
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
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipete Raya No. 10', isi: 'Sosialisasi program kesehatan lingkungan bersama warga RW 05', hari: 'Senin', tanggal: new Date('2026-03-10'), tempat: 'Jl. Bukit Duri Selatan No. 12, Bukit Duri', foto: 'foto-sosialisasi-bukit-duri.jpg', jenis_kegiatan: 'Sosialisasi', nama_kegiatan: 'Sosialisasi Kesehatan Lingkungan', link_gmaps: 'https://maps.google.com/?q=Bukit+Duri+Selatan+12', rt: '05', rw: '05', jumlah_peserta: 45, catatan: 'Kegiatan berjalan lancar, warga antusias mengikuti' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipete Raya No. 10', isi: 'Monitoring pembangunan drainase lingkungan setelah reses', hari: 'Rabu', tanggal: new Date('2026-04-15'), tempat: 'RW 03, Bukit Duri', foto: 'foto-drainase-bukit-duri.jpg', jenis_kegiatan: 'Monitoring', nama_kegiatan: 'Monitoring Drainase Lingkungan', link_gmaps: 'https://maps.google.com/?q=RW+03+Bukit+Duri', rt: '03', rw: '03', jumlah_peserta: 12, catatan: 'Progres pembangunan drainase mencapai 70%' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Gandaria Tengah', isi: 'Kunjungan ke posyandu melati untuk evaluasi program gizi', hari: 'Jumat', tanggal: new Date('2026-02-20'), tempat: 'Posyandu Melati, Jl. Tebet Barat Raya', foto: 'foto-posyandu-tebet.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Kunjungan Posyandu Melati', link_gmaps: 'https://maps.google.com/?q=Posyandu+Melati+Tebet+Barat', rt: '01', rw: '02', jumlah_peserta: 30, catatan: 'Evaluasi program gizi balita berjalan baik' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Gandaria Tengah', isi: 'Audiensi dengan pengurus RT/RW terkait perbaikan akses jalan', hari: 'Selasa', tanggal: new Date('2026-05-05'), tempat: 'Balai RW 07, Manggarai', foto: 'foto-audiensi-manggarai.jpg', jenis_kegiatan: 'Audiensi', nama_kegiatan: 'Audiensi Perbaikan Akses Jalan', link_gmaps: 'https://maps.google.com/?q=Balai+RW+07+Manggarai', rt: '07', rw: '07', jumlah_peserta: 25, catatan: 'Warga mengusulkan pengaspalan jalan sepanjang 500m' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipulir Raya', isi: 'Pembukaan program pelatihan UMKM digital untuk pemuda', hari: 'Kamis', tanggal: new Date('2026-03-25'), tempat: 'Gedung Serbaguna Pela Mampang', foto: 'foto-pelatihan-pela.jpg', jenis_kegiatan: 'Pelatihan', nama_kegiatan: 'Pelatihan UMKM Digital', link_gmaps: 'https://maps.google.com/?q=Gedung+Serbaguna+Pela+Mampang', rt: '02', rw: '03', jumlah_peserta: 60, catatan: 'Diikuti 60 peserta dari 5 kelurahan sekitar' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipulir Raya', isi: 'Peninjauan lokasi banjir bersama Dinas PU DKI Jakarta', hari: 'Senin', tanggal: new Date('2026-01-18'), tempat: 'Jl. Bangka Raya, Bangka', foto: 'foto-banjir-bangka.jpg', jenis_kegiatan: 'Peninjauan', nama_kegiatan: 'Peninjauan Lokasi Banjir', link_gmaps: 'https://maps.google.com/?q=Jl+Bangka+Raya', rt: '04', rw: '05', jumlah_peserta: 15, catatan: 'Dinas PU akan melakukan normalisasi saluran air' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Cipulir Raya', isi: 'Rapat koordinasi pembangunan taman interaktif anak', hari: 'Rabu', tanggal: new Date('2026-04-08'), tempat: 'Kelurahan Kuningan Barat', foto: 'foto-rapat-kuningan.jpg', jenis_kegiatan: 'Rapat', nama_kegiatan: 'Rapat Koordinasi Taman Interaktif', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Kuningan+Barat', rt: '01', rw: '01', jumlah_peserta: 20, catatan: 'Pembangunan akan dimulai bulan depan' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Kalibata Timur', isi: 'Kunjungan lapangan proyek revitalisasi area pasar rakyat', hari: 'Selasa', tanggal: new Date('2026-02-14'), tempat: 'Pasar Ragunan, Jl. Ragunan', foto: 'foto-pasar-ragunan.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Kunjungan Revitalisasi Pasar Ragunan', link_gmaps: 'https://maps.google.com/?q=Pasar+Ragunan', rt: '03', rw: '04', jumlah_peserta: 18, catatan: 'Proyek revitalisasi memasuki tahap akhir' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Pejaten Raya', isi: 'Penyerahan bantuan modal usaha kepada kelompok tani', hari: 'Kamis', tanggal: new Date('2026-03-20'), tempat: 'Balai Kelurahan Pejaten Barat', foto: 'foto-bantuan-pejaten.jpg', jenis_kegiatan: 'Penyerahan', nama_kegiatan: 'Penyerahan Bantuan Modal Usaha', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Pejaten+Barat', rt: '05', rw: '06', jumlah_peserta: 35, catatan: 'Bantuan modal sebesar Rp50jt disalurkan ke 25 kelompok tani' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Pejaten Raya', isi: 'Sosialisasi program pencegahan DBD di musim hujan', hari: 'Jumat', tanggal: new Date('2026-05-10'), tempat: 'RW 04, Cilandak Timur', foto: 'foto-dbd-cilandak.jpg', jenis_kegiatan: 'Sosialisasi', nama_kegiatan: 'Sosialisasi Pencegahan DBD', link_gmaps: 'https://maps.google.com/?q=RW+04+Cilandak+Timur', rt: '04', rw: '04', jumlah_peserta: 50, catatan: 'Puskesmas setempat mendukung penuh kegiatan ini' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Bintaro Raya', isi: 'Koordinasi penanganan sampah bersama Dinas Lingkungan Hidup', hari: 'Senin', tanggal: new Date('2026-04-01'), tempat: 'TPS Kalibata, Jl. Kalibata Raya', foto: 'foto-sampah-kalibata.jpg', jenis_kegiatan: 'Koordinasi', nama_kegiatan: 'Koordinasi Penanganan Sampah', link_gmaps: 'https://maps.google.com/?q=TPS+Kalibata', rt: '06', rw: '07', jumlah_peserta: 10, catatan: 'DLH akan menambah jadwal pengangkutan sampah' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Duren Tiga Raya', isi: 'Kunjungan ke SDN Cikoko 01 untuk monitoring program literasi', hari: 'Rabu', tanggal: new Date('2026-02-25'), tempat: 'SDN Cikoko 01, Jl. Cikoko Timur', foto: 'foto-sekolah-cikoko.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Monitoring Program Literasi SDN Cikoko 01', link_gmaps: 'https://maps.google.com/?q=SDN+Cikoko+01', rt: '02', rw: '03', jumlah_peserta: 120, catatan: 'Program literasi menunjukkan peningkatan minat baca siswa' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Ragunan Raya', isi: 'Peninjauan proyek pemasangan lampu penerangan jalan', hari: 'Sabtu', tanggal: new Date('2026-05-15'), tempat: 'Gang H. Saidi, Duren Tiga', foto: 'foto-pju-duren.jpg', jenis_kegiatan: 'Peninjauan', nama_kegiatan: 'Peninjauan Pemasangan PJU', link_gmaps: 'https://maps.google.com/?q=Gang+H+Saidi+Duren+Tiga', rt: '08', rw: '09', jumlah_peserta: 8, catatan: 'Pemasangan 10 titik lampu PJU sudah selesai' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Petukangan Raya', isi: 'Pelatihan kewirausahaan untuk ibu rumah tangga', hari: 'Selasa', tanggal: new Date('2026-03-12'), tempat: 'Gedung PKK Jagakarsa', foto: 'foto-pelatihan-jagakarsa.jpg', jenis_kegiatan: 'Pelatihan', nama_kegiatan: 'Pelatihan Kewirausahaan PKK', link_gmaps: 'https://maps.google.com/?q=Gedung+PKK+Jagakarsa', rt: '03', rw: '04', jumlah_peserta: 40, catatan: 'Peserta diajarkan membuat kerajinan tangan dan pemasaran online' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Petukangan Raya', isi: 'Monitoring pembangunan RPTRA bersama warga', hari: 'Kamis', tanggal: new Date('2026-04-22'), tempat: 'RW 08, Lenteng Agung', foto: 'foto-rptra-lenteng.jpg', jenis_kegiatan: 'Monitoring', nama_kegiatan: 'Monitoring Pembangunan RPTRA', link_gmaps: 'https://maps.google.com/?q=RW+08+Lenteng+Agung', rt: '08', rw: '08', jumlah_peserta: 22, catatan: 'Pembangunan RPTRA progres 85%, target selesai bulan depan' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Senayan Raya', isi: 'Koordinasi penanganan limbah usaha mikro dengan warga', hari: 'Jumat', tanggal: new Date('2026-05-08'), tempat: 'Balai Kelurahan Ciganjur', foto: 'foto-limbah-ciganjur.jpg', jenis_kegiatan: 'Koordinasi', nama_kegiatan: 'Koordinasi Penanganan Limbah', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Ciganjur', rt: '05', rw: '06', jumlah_peserta: 28, catatan: 'Warga setuju membentuk kelompok pengelola limbah mandiri' },
    { id: randomUUID(), kunjungan_jalan: 'Jl. Senayan Raya', isi: 'Pembukaan program bimbingan belajar gratis untuk siswa', hari: 'Senin', tanggal: new Date('2026-01-28'), tempat: 'Mushola Al-Ikhlas, Srengseng Sawah', foto: 'foto-bimbel-srengseng.jpg', jenis_kegiatan: 'Pendidikan', nama_kegiatan: 'Bimbingan Belajar Gratis', link_gmaps: 'https://maps.google.com/?q=Mushola+Al-Ikhlas+Srengseng+Sawah', rt: '07', rw: '08', jumlah_peserta: 35, catatan: 'Program berjalan setiap hari Senin dan Rabu' },
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
