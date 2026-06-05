import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
})

async function main() {
  console.log('Seeding...')

  // Clean existing data (order matters for FK)
  await prisma.kegiatan.deleteMany()
  await prisma.aspirasi.deleteMany()
  await prisma.kunjungan.deleteMany()
  await prisma.kelurahan.deleteMany()
  await prisma.kecamatan.deleteMany()
  await prisma.user.deleteMany()

  // === 1. Users ===
  const users = await Promise.all(
    [
      { id: 'admin-001', email: 'admin@dprd-jaksel.go.id', password: 'admin123', name: 'Admin DPRD Jakarta Selatan', role: 'admin' as const },
      { id: 'admin-002', email: 'superadmin@dprd-jaksel.go.id', password: 'superadmin123', name: 'Super Admin', role: 'admin' as const },
      { id: 'user-001', email: 'siti@email.com', password: 'user123', name: 'Siti Nurhaliza', role: 'user' as const },
      { id: 'user-002', email: 'bambang@email.com', password: 'user123', name: 'Bambang Supriyadi', role: 'user' as const },
      { id: 'user-003', email: 'dewi@email.com', password: 'user123', name: 'Dewi Sartika', role: 'user' as const },
      { id: 'user-004', email: 'hasan@email.com', password: 'user123', name: 'Hasan Basri', role: 'user' as const },
      { id: 'user-005', email: 'rudi@email.com', password: 'user123', name: 'Rudi Hartono', role: 'user' as const },
      { id: 'user-006', email: 'mulyadi@email.com', password: 'user123', name: 'Mulyadi', role: 'user' as const },
    ].map((u) => prisma.user.create({ data: u }))
  )
  console.log(`  ${users.length} users created`)

  // === 2. Kecamatan ===
  const kecData = [
    { id: 'kec-1', nama: 'Tebet' },
    { id: 'kec-2', nama: 'Mampang Prapatan' },
    { id: 'kec-3', nama: 'Pasar Minggu' },
    { id: 'kec-4', nama: 'Pancoran' },
    { id: 'kec-5', nama: 'Jagakarsa' },
  ]
  const kecamatans = await Promise.all(
    kecData.map((k) => prisma.kecamatan.create({ data: k }))
  )
  console.log(`  ${kecamatans.length} kecamatan created`)

  // === 3. Kelurahan ===
  const kelData: { id: string; kecamatan_id: string; nama: string }[] = [
    { id: 'kel-5-1', kecamatan_id: 'kec-1', nama: 'Bukit Duri' },
    { id: 'kel-5-2', kecamatan_id: 'kec-1', nama: 'Kebon Baru' },
    { id: 'kel-5-3', kecamatan_id: 'kec-1', nama: 'Manggarai' },
    { id: 'kel-5-4', kecamatan_id: 'kec-1', nama: 'Manggarai Dalam' },
    { id: 'kel-5-5', kecamatan_id: 'kec-1', nama: 'Manggarai Selatan' },
    { id: 'kel-5-6', kecamatan_id: 'kec-1', nama: 'Tebet Barat' },
    { id: 'kel-5-7', kecamatan_id: 'kec-1', nama: 'Tebet Timur' },
    { id: 'kel-2-1', kecamatan_id: 'kec-2', nama: 'Bangka' },
    { id: 'kel-2-2', kecamatan_id: 'kec-2', nama: 'Kuningan Barat' },
    { id: 'kel-2-3', kecamatan_id: 'kec-2', nama: 'Mampang Prapatan' },
    { id: 'kel-2-4', kecamatan_id: 'kec-2', nama: 'Pela Mampang' },
    { id: 'kel-2-5', kecamatan_id: 'kec-2', nama: 'Tegal Parang' },
    { id: 'kel-4-1', kecamatan_id: 'kec-3', nama: 'Cilandak Timur' },
    { id: 'kel-4-2', kecamatan_id: 'kec-3', nama: 'Jati Padang' },
    { id: 'kel-4-3', kecamatan_id: 'kec-3', nama: 'Kebagusan' },
    { id: 'kel-4-4', kecamatan_id: 'kec-3', nama: 'Pasar Minggu' },
    { id: 'kel-4-5', kecamatan_id: 'kec-3', nama: 'Pejaten Barat' },
    { id: 'kel-4-6', kecamatan_id: 'kec-3', nama: 'Pejaten Timur' },
    { id: 'kel-4-7', kecamatan_id: 'kec-3', nama: 'Ragunan' },
    { id: 'kel-3-1', kecamatan_id: 'kec-4', nama: 'Cikoko' },
    { id: 'kel-3-2', kecamatan_id: 'kec-4', nama: 'Duren Tiga' },
    { id: 'kel-3-3', kecamatan_id: 'kec-4', nama: 'Kalibata' },
    { id: 'kel-3-4', kecamatan_id: 'kec-4', nama: 'Pancoran' },
    { id: 'kel-3-5', kecamatan_id: 'kec-4', nama: 'Pengadegan' },
    { id: 'kel-3-6', kecamatan_id: 'kec-4', nama: 'Rawa Jati' },
    { id: 'kel-1-1', kecamatan_id: 'kec-5', nama: 'Ciganjur' },
    { id: 'kel-1-2', kecamatan_id: 'kec-5', nama: 'Cipedak' },
    { id: 'kel-1-3', kecamatan_id: 'kec-5', nama: 'Jagakarsa' },
    { id: 'kel-1-4', kecamatan_id: 'kec-5', nama: 'Lenteng Agung' },
    { id: 'kel-1-5', kecamatan_id: 'kec-5', nama: 'Srengseng Sawah' },
    { id: 'kel-1-6', kecamatan_id: 'kec-5', nama: 'Tanjung Barat' },
  ]
  const kelurahans = await Promise.all(
    kelData.map((k) => prisma.kelurahan.create({ data: k }))
  )
  console.log(`  ${kelurahans.length} kelurahan created`)

  // === 4. Kunjungan ===
  const kunjunganData = [
    { id: 'k-001', tanggal: new Date('2026-01-15'), jam: '09:30', jalan: 'Jl. Cipete Raya No. 10', kelurahan_id: 'kel-2-2', kecamatan_id: 'kec-2', kota: 'Jakarta Selatan' },
    { id: 'k-002', tanggal: new Date('2026-01-20'), jam: '10:00', jalan: 'Jl. Gandaria Tengah', kelurahan_id: 'kel-2-3', kecamatan_id: 'kec-2', kota: 'Jakarta Selatan' },
    { id: 'k-003', tanggal: new Date('2026-02-05'), jam: '08:45', jalan: 'Jl. Cipulir Raya', kelurahan_id: 'kel-5-3', kecamatan_id: 'kec-1', kota: 'Jakarta Selatan' },
    { id: 'k-004', tanggal: new Date('2026-02-18'), jam: '13:15', jalan: 'Jl. Kalibata Timur', kelurahan_id: 'kel-3-3', kecamatan_id: 'kec-4', kota: 'Jakarta Selatan' },
    { id: 'k-005', tanggal: new Date('2026-03-02'), jam: '09:00', jalan: 'Jl. Pejaten Raya', kelurahan_id: 'kel-4-5', kecamatan_id: 'kec-3', kota: 'Jakarta Selatan' },
    { id: 'k-006', tanggal: new Date('2026-03-10'), jam: '10:30', jalan: 'Jl. Bintaro Raya', kelurahan_id: 'kel-4-1', kecamatan_id: 'kec-3', kota: 'Jakarta Selatan' },
    { id: 'k-007', tanggal: new Date('2026-04-01'), jam: '11:00', jalan: 'Jl. Duren Tiga Raya', kelurahan_id: 'kel-3-2', kecamatan_id: 'kec-4', kota: 'Jakarta Selatan' },
    { id: 'k-008', tanggal: new Date('2026-04-20'), jam: '08:30', jalan: 'Jl. Ragunan Raya', kelurahan_id: 'kel-4-7', kecamatan_id: 'kec-3', kota: 'Jakarta Selatan' },
    { id: 'k-009', tanggal: new Date('2026-05-05'), jam: '09:15', jalan: 'Jl. Petukangan Raya', kelurahan_id: 'kel-1-1', kecamatan_id: 'kec-5', kota: 'Jakarta Selatan' },
    { id: 'k-010', tanggal: new Date('2026-05-12'), jam: '14:00', jalan: 'Jl. Senayan Raya', kelurahan_id: 'kel-2-4', kecamatan_id: 'kec-2', kota: 'Jakarta Selatan' },
  ]
  const kunjungans = await Promise.all(
    kunjunganData.map((k) => prisma.kunjungan.create({ data: k }))
  )
  console.log(`  ${kunjungans.length} kunjungan created`)

  // === 5. Aspirasi ===
  const aspirasiData = [
    { id: 'a-001', sumber: 'LEMBAR_ASPIRASI_RESES' as const, deskripsi: 'Warga mengusulkan perbaikan drainase di RW 03 Kelurahan Bukit Duri karena sering banjir saat hujan deras.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ahmad Fauzi', pelapor_email: 'ahmad.fauzi@email.com', pelapor_telepon: '081234567890', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15') },
    { id: 'a-002', sumber: 'LEMBAR_ASPIRASI_SOSPERDA' as const, deskripsi: 'Usulan pembangunan posyandu untuk melayani balita dan lansia di Kelurahan Bangka.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Siti Nurhaliza', pelapor_email: 'siti.nur@email.com', pelapor_telepon: '081234567891', kategori_usulan: 'Kesehatan', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-01-20'), catatan_tindak_lanjut: 'Sedang dalam proses koordinasi dengan Dinas Kesehatan Jakarta Selatan.' },
    { id: 'a-003', sumber: 'ASPIRASI_PROPOSAL_LANGSUNG' as const, deskripsi: 'Pengajuan bantuan modal usaha untuk kelompok UMKM binaan Kelurahan Pejaten Barat sebanyak 50 orang.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Bambang Supriyadi', pelapor_email: 'bambang@email.com', pelapor_telepon: '081234567892', kategori_usulan: 'Ekonomi', jenis_usulan: 'Bantuan Modal', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-02-05'), catatan_tindak_lanjut: 'Bantuan modal sudah disalurkan melalui Dinas Koperasi dan UMKM DKI Jakarta.' },
    { id: 'a-004', sumber: 'KOORDINASI_DINAS_TERKAIT' as const, deskripsi: 'Koordinasi dengan Dinas Pendidikan terkait renovasi 3 ruang kelas SDN Kalibata 01 yang rusak berat.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Dewi Sartika', pelapor_email: 'dewi.sartika@email.com', pelapor_telepon: '081234567893', kategori_usulan: 'Pendidikan', jenis_usulan: 'Renovasi', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-02-20'), catatan_tindak_lanjut: 'Surat rekomendasi sudah dikirim ke Dinas Pendidikan, menunggu jadwal survei.' },
    { id: 'a-005', sumber: 'USULAN_MUSRENBANG_DEWAN' as const, deskripsi: 'Usulan pembangunan jalan lingkungan di RW 05 Kelurahan Jagakarsa yang masih berupa tanah.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Hasan Basri', pelapor_email: 'hasan.basri@email.com', pelapor_telepon: '081234567894', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-03-02'), catatan_tindak_lanjut: 'Jalan sudah diaspal pada bulan Maret 2026 oleh Dinas Bina Marga DKI Jakarta.' },
    { id: 'a-006', sumber: 'CALL_CENTER' as const, deskripsi: 'Laporan warga tentang tiang listrik miring di Jl. Raya Lenteng Agung yang membahayakan pengguna jalan.', status: 'TIDAK_BISA_DITINDAKLANJUTI' as const, pelapor_nama: 'Rudi Hartono', pelapor_email: '', pelapor_telepon: '081234567895', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Tidak bisa ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15') },
    { id: 'a-007', sumber: 'LEMBAR_ASPIRASI_RESES' as const, deskripsi: 'Permohonan penerangan jalan umum (PJU) di Gang H. Saidi, Kelurahan Duren Tiga yang gelap gulita.', status: 'SEDANG_DITINDAKLANJUTI' as const, pelapor_nama: 'Mulyadi', pelapor_email: 'mulyadi@email.com', pelapor_telepon: '081234567896', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Koordinasi dengan dinas terkait', tanggal_dibuat: new Date('2026-04-01'), catatan_tindak_lanjut: 'Surat menyurat dengan Dinas Bina Marga sudah dilakukan, menunggu realisasi pemasangan.' },
    { id: 'a-008', sumber: 'KOORDINASI_DINAS_TERKAIT' as const, deskripsi: 'Koordinasi penanganan sampah di TPS liar Kelurahan Ragunan dengan Dinas Lingkungan Hidup.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ani Susanti', pelapor_email: 'ani.susanti@email.com', pelapor_telepon: '081234567897', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15') },
    { id: 'a-009', sumber: 'CALL_CENTER' as const, deskripsi: 'Pengaduan suara bising dari gudang proyek di dekat pemukiman warga Kelurahan Tebet Timur.', status: 'SUDAH_DITINDAKLANJUTI' as const, pelapor_nama: 'Fajar Ramadhan', pelapor_email: 'fajar@email.com', pelapor_telepon: '081234567898', kategori_usulan: 'Lingkungan', jenis_usulan: 'Pengaduan', jenis_reses: 'Reses Periode II', tindak_lanjut: 'Sudah direalisasikan', tanggal_dibuat: new Date('2026-05-05'), catatan_tindak_lanjut: 'Pihak pengelola sudah diberikan teguran dan diminta membatasi jam operasional.' },
    { id: 'a-010', sumber: 'USULAN_MUSRENBANG_DEWAN' as const, deskripsi: 'Usulan pembangunan taman bermain anak di area RPTRA Kelurahan Srengseng Sawah untuk fasilitas publik.', status: 'BELUM_DITINDAKLANJUTI' as const, pelapor_nama: 'Ratna Dewi', pelapor_email: 'ratna.dewi@email.com', pelapor_telepon: '081234567899', kategori_usulan: 'Infrastruktur', jenis_usulan: 'Pembangunan', jenis_reses: 'Reses Periode I', tindak_lanjut: 'Belum ditindaklanjuti', tanggal_dibuat: new Date('2026-01-15') },
  ]
  const aspirasis = await Promise.all(
    aspirasiData.map((a) => prisma.aspirasi.create({ data: a }))
  )
  console.log(`  ${aspirasis.length} aspirasi created`)

  // === 6. Kegiatan ===
  const kegiatanData = [
    { id: 'kg-001', kunjungan_id: 'k-001', isi: 'Sosialisasi program kesehatan lingkungan bersama warga RW 05', hari: 'Senin', tanggal: new Date('2026-03-10'), lokasi: 'Jl. Bukit Duri Selatan No. 12, Bukit Duri', foto: 'foto-sosialisasi-bukit-duri.jpg', jenis_kegiatan: 'Sosialisasi', nama_kegiatan: 'Sosialisasi Kesehatan Lingkungan', link_gmaps: 'https://maps.google.com/?q=Bukit+Duri+Selatan+12', rt: '05', rw: '05', jumlah_peserta: 45, catatan: 'Kegiatan berjalan lancar, warga antusias mengikuti' },
    { id: 'kg-002', kunjungan_id: 'k-001', isi: 'Monitoring pembangunan drainase lingkungan setelah reses', hari: 'Rabu', tanggal: new Date('2026-04-15'), lokasi: 'RW 03, Bukit Duri', foto: 'foto-drainase-bukit-duri.jpg', jenis_kegiatan: 'Monitoring', nama_kegiatan: 'Monitoring Drainase Lingkungan', link_gmaps: 'https://maps.google.com/?q=RW+03+Bukit+Duri', rt: '03', rw: '03', jumlah_peserta: 12, catatan: 'Progres pembangunan drainase mencapai 70%' },
    { id: 'kg-003', kunjungan_id: 'k-002', isi: 'Kunjungan ke posyandu melati untuk evaluasi program gizi', hari: 'Jumat', tanggal: new Date('2026-02-20'), lokasi: 'Posyandu Melati, Jl. Tebet Barat Raya', foto: 'foto-posyandu-tebet.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Kunjungan Posyandu Melati', link_gmaps: 'https://maps.google.com/?q=Posyandu+Melati+Tebet+Barat', rt: '01', rw: '02', jumlah_peserta: 30, catatan: 'Evaluasi program gizi balita berjalan baik' },
    { id: 'kg-004', kunjungan_id: 'k-002', isi: 'Audiensi dengan pengurus RT/RW terkait perbaikan akses jalan', hari: 'Selasa', tanggal: new Date('2026-05-05'), lokasi: 'Balai RW 07, Manggarai', foto: 'foto-audiensi-manggarai.jpg', jenis_kegiatan: 'Audiensi', nama_kegiatan: 'Audiensi Perbaikan Akses Jalan', link_gmaps: 'https://maps.google.com/?q=Balai+RW+07+Manggarai', rt: '07', rw: '07', jumlah_peserta: 25, catatan: 'Warga mengusulkan pengaspalan jalan sepanjang 500m' },
    { id: 'kg-005', kunjungan_id: 'k-003', isi: 'Pembukaan program pelatihan UMKM digital untuk pemuda', hari: 'Kamis', tanggal: new Date('2026-03-25'), lokasi: 'Gedung Serbaguna Pela Mampang', foto: 'foto-pelatihan-pela.jpg', jenis_kegiatan: 'Pelatihan', nama_kegiatan: 'Pelatihan UMKM Digital', link_gmaps: 'https://maps.google.com/?q=Gedung+Serbaguna+Pela+Mampang', rt: '02', rw: '03', jumlah_peserta: 60, catatan: 'Diikuti 60 peserta dari 5 kelurahan sekitar' },
    { id: 'kg-006', kunjungan_id: 'k-003', isi: 'Peninjauan lokasi banjir bersama Dinas PU DKI Jakarta', hari: 'Senin', tanggal: new Date('2026-01-18'), lokasi: 'Jl. Bangka Raya, Bangka', foto: 'foto-banjir-bangka.jpg', jenis_kegiatan: 'Peninjauan', nama_kegiatan: 'Peninjauan Lokasi Banjir', link_gmaps: 'https://maps.google.com/?q=Jl+Bangka+Raya', rt: '04', rw: '05', jumlah_peserta: 15, catatan: 'Dinas PU akan melakukan normalisasi saluran air' },
    { id: 'kg-007', kunjungan_id: 'k-003', isi: 'Rapat koordinasi pembangunan taman interaktif anak', hari: 'Rabu', tanggal: new Date('2026-04-08'), lokasi: 'Kelurahan Kuningan Barat', foto: 'foto-rapat-kuningan.jpg', jenis_kegiatan: 'Rapat', nama_kegiatan: 'Rapat Koordinasi Taman Interaktif', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Kuningan+Barat', rt: '01', rw: '01', jumlah_peserta: 20, catatan: 'Pembangunan akan dimulai bulan depan' },
    { id: 'kg-008', kunjungan_id: 'k-004', isi: 'Kunjungan lapangan proyek revitalisasi area pasar rakyat', hari: 'Selasa', tanggal: new Date('2026-02-14'), lokasi: 'Pasar Ragunan, Jl. Ragunan', foto: 'foto-pasar-ragunan.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Kunjungan Revitalisasi Pasar Ragunan', link_gmaps: 'https://maps.google.com/?q=Pasar+Ragunan', rt: '03', rw: '04', jumlah_peserta: 18, catatan: 'Proyek revitalisasi memasuki tahap akhir' },
    { id: 'kg-009', kunjungan_id: 'k-005', isi: 'Penyerahan bantuan modal usaha kepada kelompok tani', hari: 'Kamis', tanggal: new Date('2026-03-20'), lokasi: 'Balai Kelurahan Pejaten Barat', foto: 'foto-bantuan-pejaten.jpg', jenis_kegiatan: 'Penyerahan', nama_kegiatan: 'Penyerahan Bantuan Modal Usaha', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Pejaten+Barat', rt: '05', rw: '06', jumlah_peserta: 35, catatan: 'Bantuan modal sebesar Rp50jt disalurkan ke 25 kelompok tani' },
    { id: 'kg-010', kunjungan_id: 'k-005', isi: 'Sosialisasi program pencegahan DBD di musim hujan', hari: 'Jumat', tanggal: new Date('2026-05-10'), lokasi: 'RW 04, Cilandak Timur', foto: 'foto-dbd-cilandak.jpg', jenis_kegiatan: 'Sosialisasi', nama_kegiatan: 'Sosialisasi Pencegahan DBD', link_gmaps: 'https://maps.google.com/?q=RW+04+Cilandak+Timur', rt: '04', rw: '04', jumlah_peserta: 50, catatan: 'Puskesmas setempat mendukung penuh kegiatan ini' },
    { id: 'kg-011', kunjungan_id: 'k-006', isi: 'Koordinasi penanganan sampah bersama Dinas Lingkungan Hidup', hari: 'Senin', tanggal: new Date('2026-04-01'), lokasi: 'TPS Kalibata, Jl. Kalibata Raya', foto: 'foto-sampah-kalibata.jpg', jenis_kegiatan: 'Koordinasi', nama_kegiatan: 'Koordinasi Penanganan Sampah', link_gmaps: 'https://maps.google.com/?q=TPS+Kalibata', rt: '06', rw: '07', jumlah_peserta: 10, catatan: 'DLH akan menambah jadwal pengangkutan sampah' },
    { id: 'kg-012', kunjungan_id: 'k-007', isi: 'Kunjungan ke SDN Cikoko 01 untuk monitoring program literasi', hari: 'Rabu', tanggal: new Date('2026-02-25'), lokasi: 'SDN Cikoko 01, Jl. Cikoko Timur', foto: 'foto-sekolah-cikoko.jpg', jenis_kegiatan: 'Kunjungan', nama_kegiatan: 'Monitoring Program Literasi SDN Cikoko 01', link_gmaps: 'https://maps.google.com/?q=SDN+Cikoko+01', rt: '02', rw: '03', jumlah_peserta: 120, catatan: 'Program literasi menunjukkan peningkatan minat baca siswa' },
    { id: 'kg-013', kunjungan_id: 'k-008', isi: 'Peninjauan proyek pemasangan lampu penerangan jalan', hari: 'Sabtu', tanggal: new Date('2026-05-15'), lokasi: 'Gang H. Saidi, Duren Tiga', foto: 'foto-pju-duren.jpg', jenis_kegiatan: 'Peninjauan', nama_kegiatan: 'Peninjauan Pemasangan PJU', link_gmaps: 'https://maps.google.com/?q=Gang+H+Saidi+Duren+Tiga', rt: '08', rw: '09', jumlah_peserta: 8, catatan: 'Pemasangan 10 titik lampu PJU sudah selesai' },
    { id: 'kg-014', kunjungan_id: 'k-009', isi: 'Pelatihan kewirausahaan untuk ibu rumah tangga', hari: 'Selasa', tanggal: new Date('2026-03-12'), lokasi: 'Gedung PKK Jagakarsa', foto: 'foto-pelatihan-jagakarsa.jpg', jenis_kegiatan: 'Pelatihan', nama_kegiatan: 'Pelatihan Kewirausahaan PKK', link_gmaps: 'https://maps.google.com/?q=Gedung+PKK+Jagakarsa', rt: '03', rw: '04', jumlah_peserta: 40, catatan: 'Peserta diajarkan membuat kerajinan tangan dan pemasaran online' },
    { id: 'kg-015', kunjungan_id: 'k-009', isi: 'Monitoring pembangunan RPTRA bersama warga', hari: 'Kamis', tanggal: new Date('2026-04-22'), lokasi: 'RW 08, Lenteng Agung', foto: 'foto-rptra-lenteng.jpg', jenis_kegiatan: 'Monitoring', nama_kegiatan: 'Monitoring Pembangunan RPTRA', link_gmaps: 'https://maps.google.com/?q=RW+08+Lenteng+Agung', rt: '08', rw: '08', jumlah_peserta: 22, catatan: 'Pembangunan RPTRA progres 85%, target selesai bulan depan' },
    { id: 'kg-016', kunjungan_id: 'k-010', isi: 'Koordinasi penanganan limbah usaha mikro dengan warga', hari: 'Jumat', tanggal: new Date('2026-05-08'), lokasi: 'Balai Kelurahan Ciganjur', foto: 'foto-limbah-ciganjur.jpg', jenis_kegiatan: 'Koordinasi', nama_kegiatan: 'Koordinasi Penanganan Limbah', link_gmaps: 'https://maps.google.com/?q=Kelurahan+Ciganjur', rt: '05', rw: '06', jumlah_peserta: 28, catatan: 'Warga setuju membentuk kelompok pengelola limbah mandiri' },
    { id: 'kg-017', kunjungan_id: 'k-010', isi: 'Pembukaan program bimbingan belajar gratis untuk siswa', hari: 'Senin', tanggal: new Date('2026-01-28'), lokasi: 'Mushola Al-Ikhlas, Srengseng Sawah', foto: 'foto-bimbel-srengseng.jpg', jenis_kegiatan: 'Pendidikan', nama_kegiatan: 'Bimbingan Belajar Gratis', link_gmaps: 'https://maps.google.com/?q=Mushola+Al-Ikhlas+Srengseng+Sawah', rt: '07', rw: '08', jumlah_peserta: 35, catatan: 'Program berjalan setiap hari Senin dan Rabu' },
  ]
  const kegiatans = await Promise.all(
    kegiatanData.map((k) => prisma.kegiatan.create({ data: k }))
  )
  console.log(`  ${kegiatans.length} kegiatan created`)

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
