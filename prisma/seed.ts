import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Inisialisasi Pool PG untuk koneksi stabil ke PostgreSQL Laragon
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

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
    return {
      kota: kota.trim(),
      kecamatan: kecamatan.trim(),
      kelurahan: kelurahan.trim(),
    }
  })
}

async function main() {
  console.log('Seeding database...')

  // 0. Cleanup dengan urutan child-first
  await prisma.kegiatan.deleteMany()
  await prisma.trackingAspirasi.deleteMany()
  await prisma.aspirasis.deleteMany()
  await prisma.relawan.deleteMany()
  await prisma.kunjungan.deleteMany()
  await prisma.userTeam.deleteMany()
  await prisma.kelurahan.deleteMany()
  await prisma.kecamatan.deleteMany()
  await prisma.kota.deleteMany()
  await prisma.rolePermission.deleteMany()
  await prisma.role.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.team.deleteMany()
  await prisma.dprd.deleteMany()

  // 1. Parse CSV & Create Wilayah
  const rows = parseCsv()

  const kotaSet = new Set(rows.map((r) => r.kota))
  const kotaMap = new Map<string, string>()
  for (const nama of Array.from(kotaSet)) {
    const k = await prisma.kota.create({ data: { nama } })
    kotaMap.set(nama, k.id)
  }
  console.log(`  ${kotaMap.size} kota created`)

  const kecamatanMap = new Map<string, string>()
  for (const r of rows) {
    const key = `${r.kota}|${r.kecamatan}`
    if (!kecamatanMap.has(key)) {
      const kotaId = kotaMap.get(r.kota)
      if (kotaId) {
        const k = await prisma.kecamatan.create({
          data: { nama: r.kecamatan, kota_id: kotaId },
        })
        kecamatanMap.set(key, k.id)
      }
    }
  }
  console.log(`  ${kecamatanMap.size} kecamatan created`)

  const kelurahanMap = new Map<string, string>()
  for (const r of rows) {
    const keyKec = `${r.kota}|${r.kecamatan}`
    const keyKel = `${r.kecamatan}|${r.kelurahan}`
    const kecamatanId = kecamatanMap.get(keyKec)

    if (kecamatanId && !kelurahanMap.has(keyKel)) {
      const k = await prisma.kelurahan.create({
        data: { nama: r.kelurahan, kecamatan_id: kecamatanId },
      })
      kelurahanMap.set(keyKel, k.id)
    }
  }
  console.log(`  ${kelurahanMap.size} kelurahan created`)

  const getWilayahIds = (kota: string, kecamatan: string, kelurahan: string) => {
    const kotaId = kotaMap.get(kota) || Array.from(kotaMap.values())[0]
    const kecKey = `${kota}|${kecamatan}`
    const kecamatanId = kecamatanMap.get(kecKey) || Array.from(kecamatanMap.values())[0]
    const kelKey = `${kecamatan}|${kelurahan}`
    const kelurahanId = kelurahanMap.get(kelKey) || Array.from(kelurahanMap.values())[0]

    return { kotaId, kecamatanId, kelurahanId }
  }

  // 2. DPRD & Team
  const dprd = await prisma.dprd.create({
    data: {
      name: 'DPRD Kota Jakarta Selatan',
      description: 'Dewan Perwakilan Rakyat Daerah Kota Jakarta Selatan',
      is_active: true,
    },
  })
  console.log('  1 dprd created')

  const team = await prisma.team.create({
    data: {
      dprd_id: dprd.id,
      name: 'Tim Eksternal (Kantor)',
      description: 'Tim kerja utama',
      is_active: true,
    },
  })
  console.log('  1 team created')

  // 3. Users
  await prisma.user.createMany({
    data: [
      {
        id: 'b4e89bf1-d692-47e3-b312-18d273ed1efe',
        username: 'admin',
        email: 'admin@dprd-jaksel.go.id',
        password: 'admin123',
        name: 'Admin DPRD Jakarta Selatan',
        role: 'admin',
        dprd_id: dprd.id,
      },
      {
        id: '85b1bee3-c244-4797-8f71-daf56bf42c98',
        username: 'superadmin',
        email: 'superadmin@dprd-jaksel.go.id',
        password: 'superadmin123',
        name: 'Super Admin',
        role: 'admin',
        dprd_id: dprd.id,
      },
    ],
  })
  console.log('  2 users created')

  const seededUsers = await prisma.user.findMany({
    where: { username: { in: ['admin', 'superadmin'] } },
    select: { id: true, username: true },
  })
  await prisma.userTeam.createMany({
    data: seededUsers.map((u) => ({
      user_id: u.id,
      team_id: team.id,
      role: u.username === 'superadmin' ? 'KETUA' : 'ANGGOTA',
    })),
  })
  console.log('  2 user_teams created')

  // 4. Kunjungan
  const kunjunganInput = [
    {
      id: randomUUID(),
      tanggal: new Date('2026-01-15'),
      jam: '09:30',
      jalan: 'Jl. Cipete Raya No. 10',
      kota: 'Jakarta Selatan',
      kecamatan: 'Mampang Prapatan',
      kelurahan: 'Kuningan Barat',
    },
    {
      id: randomUUID(),
      tanggal: new Date('2026-01-20'),
      jam: '10:00',
      jalan: 'Jl. Gandaria Tengah',
      kota: 'Jakarta Selatan',
      kecamatan: 'Mampang Prapatan',
      kelurahan: 'Mampang Prapatan',
    },
    {
      id: randomUUID(),
      tanggal: new Date('2026-02-05'),
      jam: '08:45',
      jalan: 'Jl. Cipulir Raya',
      kota: 'Jakarta Selatan',
      kecamatan: 'Tebet',
      kelurahan: 'Manggarai',
    },
    {
      id: randomUUID(),
      tanggal: new Date('2026-02-18'),
      jam: '13:15',
      jalan: 'Jl. Kalibata Timur',
      kota: 'Jakarta Selatan',
      kecamatan: 'Pancoran',
      kelurahan: 'Kalibata',
    },
    {
      id: randomUUID(),
      tanggal: new Date('2026-03-02'),
      jam: '09:00',
      jalan: 'Jl. Pejaten Raya',
      kota: 'Jakarta Selatan',
      kecamatan: 'Pasar Minggu',
      kelurahan: 'Pejaten Barat',
    },
  ]

  const kunjunganRecords = await Promise.all(
    kunjunganInput.map((k) => {
      const { kotaId, kecamatanId, kelurahanId } = getWilayahIds(k.kota, k.kecamatan, k.kelurahan)
      return prisma.kunjungan.create({
        data: {
          id: k.id,
          tanggal: k.tanggal,
          jam: k.jam,
          jalan: k.jalan,
          kota_id: kotaId,
          kecamatan_id: kecamatanId,
          kelurahan_id: kelurahanId,
        },
      })
    }),
  )

  const kunjunganByJalan = new Map(kunjunganRecords.map((k) => [k.jalan, k]))
  console.log(`  ${kunjunganRecords.length} kunjungan created`)

  // 4. Aspirasi & Tracking
  const aspirasiData = [
    {
      id: randomUUID(),
      id_laporan: 'LAP-1A2B3C4D5E',
      sumber: 'LEMBAR_ASPIRASI_RESES' as const,
      deskripsi:
        'Warga mengusulkan perbaikan drainase di RW 03 Kelurahan Bukit Duri karena sering banjir saat hujan deras.',
      status: 'BELUM_DITINDAKLANJUTI' as const,
      pelapor_nama: 'Ahmad Fauzi',
      pelapor_email: 'ahmad.fauzi@email.com',
      pelapor_telepon: '081234567890',
      kategori_usulan: 'Infrastruktur',
      jenis_usulan: 'Pembangunan',
      jenis_reses: 'Reses Periode I',
      tindak_lanjut: 'Belum ditindaklanjuti',
      created_at: new Date('2026-01-15'),
      kota: 'Jakarta Selatan',
      kecamatan: 'Tebet',
      kelurahan: 'Bukit Duri',
      alamat: 'RW 03 Kelurahan Bukit Duri',
    },
    {
      id: randomUUID(),
      id_laporan: 'LAP-D80I0T7I97',
      sumber: 'LEMBAR_ASPIRASI_SOSPERDA' as const,
      deskripsi: 'Usulan pembangunan posyandu untuk melayani balita dan lansia di Kelurahan Bangka.',
      status: 'SEDANG_DITINDAKLANJUTI' as const,
      pelapor_nama: 'Siti Nurhaliza',
      pelapor_email: 'siti.nur@email.com',
      pelapor_telepon: '081234567891',
      kategori_usulan: 'Kesehatan',
      jenis_usulan: 'Pembangunan',
      jenis_reses: 'Reses Periode I',
      tindak_lanjut: 'Koordinasi dengan dinas terkait',
      created_at: new Date('2026-01-20'),
      catatan_tindak_lanjut: 'Sedang dalam proses koordinasi dengan Dinas Kesehatan Jakarta Selatan.',
      kota: 'Jakarta Selatan',
      kecamatan: 'Mampang Prapatan',
      kelurahan: 'Bangka',
      alamat: 'Kelurahan Bangka',
    },
    {
      id: randomUUID(),
      id_laporan: 'LAP-CW17WRM893',
      sumber: 'ASPIRASI_PROPOSAL_LANGSUNG' as const,
      deskripsi: 'Pengajuan bantuan modal usaha untuk kelompok UMKM binaan Kelurahan Pejaten Barat.',
      status: 'SUDAH_DITINDAKLANJUTI' as const,
      pelapor_nama: 'Bambang Supriyadi',
      pelapor_email: 'bambang@email.com',
      pelapor_telepon: '081234567892',
      kategori_usulan: 'Ekonomi',
      jenis_usulan: 'Bantuan Modal',
      jenis_reses: 'Reses Periode II',
      tindak_lanjut: 'Sudah direalisasikan',
      created_at: new Date('2026-02-05'),
      catatan_tindak_lanjut: 'Bantuan modal sudah disalurkan melalui Dinas Koperasi dan UMKM DKI Jakarta.',
      kota: 'Jakarta Selatan',
      kecamatan: 'Pasar Minggu',
      kelurahan: 'Pejaten Barat',
      alamat: 'Kelurahan Pejaten Barat',
    },
  ]

  for (const { kota, kecamatan, kelurahan, alamat, catatan_tindak_lanjut, created_at, ...a } of aspirasiData) {
    const { kotaId, kecamatanId, kelurahanId } = getWilayahIds(kota, kecamatan, kelurahan)

    await prisma.aspirasis.create({
      data: {
        ...a,
        tanggal_dibuat: created_at,
        created_at,
        kota_id: kotaId,
        kecamatan_id: kecamatanId,
        kelurahan_id: kelurahanId,
        alamat,
      },
    })

    const trackings = []
    if (a.status === 'BELUM_DITINDAKLANJUTI') {
      trackings.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI', created_at })
    } else if (a.status === 'SEDANG_DITINDAKLANJUTI') {
      trackings.push({ aspirasi_id: a.id, status: 'BELUM_DITINDAKLANJUTI', created_at })
      trackings.push({
        aspirasi_id: a.id,
        status: 'SEDANG_DITINDAKLANJUTI',
        catatan: catatan_tindak_lanjut,
        created_at: new Date(),
        diverifikasi_oleh_id: '85b1bee3-c244-4797-8f71-daf56bf42c98',
      })
    } else if (a.status === 'SUDAH_DITINDAKLANJUTI') {
      trackings.push({
        aspirasi_id: a.id,
        status: 'BELUM_DITINDAKLANJUTI',
        created_at,
      })
      trackings.push({
        aspirasi_id: a.id,
        status: 'SEDANG_DITINDAKLANJUTI',
        catatan: 'Proses koordinasi',
        created_at,
        diverifikasi_oleh_id: 'b4e89bf1-d692-47e3-b312-18d273ed1efe',
      })
      trackings.push({
        aspirasi_id: a.id,
        status: 'SUDAH_DITINDAKLANJUTI',
        catatan: catatan_tindak_lanjut,
        created_at: new Date(),
        diverifikasi_oleh_id: 'b4e89bf1-d692-47e3-b312-18d273ed1efe',
      })
    }

    await prisma.trackingAspirasi.createMany({ data: trackings })
  }
  console.log(`  ${aspirasiData.length} aspirasi & tracking created`)

  // 5. Relawan
  const relawanData = [
    {
      id: randomUUID(),
      nik: '3174011234560001',
      nama: 'Ahmad Fauzi',
      no_telepon: '081234567890',
      jenis_kelamin: 'LAKI_LAKI' as const,
      alamat: 'Jl. Bukit Duri Selatan RT 05 RW 05',
      posisi: 'KOORDINATOR_RW' as const,
      kota: 'Jakarta Selatan',
      kecamatan: 'Tebet',
      kelurahan: 'Bukit Duri',
    },
  ]

  await Promise.all(
    relawanData.map(({ kota, kecamatan, kelurahan, ...r }) => {
      const { kotaId, kecamatanId, kelurahanId } = getWilayahIds(kota, kecamatan, kelurahan)
      return prisma.relawan.create({
        data: {
          ...r,
          kota_id: kotaId,
          kecamatan_id: kecamatanId,
          kelurahan_id: kelurahanId,
          team_id: team.id,
        },
      })
    }),
  )
  console.log(`  ${relawanData.length} relawan created`)

  // 6. Kegiatan
  const kegiatanData = [
    {
      id: randomUUID(),
      kunjungan_jalan: 'Jl. Cipete Raya No. 10',
      isi: 'Sosialisasi program kesehatan lingkungan bersama warga RW 05',
      hari: 'Senin',
      tanggal: new Date('2026-03-10'),
      tempat: 'Jl. Bukit Duri Selatan No. 12, Bukit Duri',
      foto: ['foto-sosialisasi-bukit-duri.jpg'],
      jenis_kegiatan: 'Sosialisasi',
      nama_kegiatan: 'Sosialisasi Kesehatan Lingkungan',
      link_gmaps: 'https://maps.google.com/?q=Bukit+Duri+Selatan+12',
      rt: '05',
      rw: '05',
      jumlah_peserta: 45,
      catatan: 'Kegiatan berjalan lancar, warga antusias mengikuti',
      dibuat_oleh_id: '85b1bee3-c244-4797-8f71-daf56bf42c98',
    },
  ]

  await Promise.all(
    kegiatanData.map(({ kunjungan_jalan, ...k }) => {
      const kunjungan = kunjunganByJalan.get(kunjungan_jalan) || kunjunganRecords[0]
      return prisma.kegiatan.create({
        data: {
          ...k,
          kunjungan_id: kunjungan.id,
          team_id: team.id,
        },
      })
    }),
  )
  console.log(`  ${kegiatanData.length} kegiatan created`)

  // 6. RBAC: Roles & Permissions
  const permissionData = [
    // Dashboard
    { name: 'dashboard:read', resource: 'dashboard', action: 'read', description: 'Melihat dashboard' },
    // Aspirasi
    { name: 'aspirasi:read', resource: 'aspirasi', action: 'read', description: 'Melihat aspirasi' },
    { name: 'aspirasi:write', resource: 'aspirasi', action: 'write', description: 'Input & edit aspirasi' },
    { name: 'aspirasi:delete', resource: 'aspirasi', action: 'delete', description: 'Menghapus aspirasi' },
    // Kunjungan / Kegiatan
    { name: 'kunjungan:read', resource: 'kunjungan', action: 'read', description: 'Melihat kunjungan' },
    { name: 'kunjungan:write', resource: 'kunjungan', action: 'write', description: 'Input & edit kunjungan' },
    { name: 'kunjungan:delete', resource: 'kunjungan', action: 'delete', description: 'Menghapus kunjungan' },
    // Relawan
    { name: 'relawan:read', resource: 'relawan', action: 'read', description: 'Melihat relawan' },
    { name: 'relawan:write', resource: 'relawan', action: 'write', description: 'Input & edit relawan' },
    { name: 'relawan:delete', resource: 'relawan', action: 'delete', description: 'Menghapus relawan' },
    // Pengaturan
    { name: 'pengaturan:read', resource: 'pengaturan', action: 'read', description: 'Melihat pengaturan' },
    { name: 'pengaturan:write', resource: 'pengaturan', action: 'write', description: 'Ubah pengaturan' },
    // RBAC (kelola role & permission)
    { name: 'rbac:read', resource: 'rbac', action: 'read', description: 'Melihat role & permission' },
    { name: 'rbac:write', resource: 'rbac', action: 'write', description: 'Kelola role & permission' },
    // Teams
    { name: 'teams:read', resource: 'teams', action: 'read', description: 'Melihat tim kerja' },
    { name: 'teams:write', resource: 'teams', action: 'write', description: 'Input & edit tim kerja' },
    { name: 'teams:delete', resource: 'teams', action: 'delete', description: 'Menghapus tim kerja' },
    // DPRD
    { name: 'dprd:read', resource: 'dprd', action: 'read', description: 'Melihat DPRD' },
    { name: 'dprd:write', resource: 'dprd', action: 'write', description: 'Input & edit DPRD' },
    { name: 'dprd:delete', resource: 'dprd', action: 'delete', description: 'Menghapus DPRD' },
  ]

  const permissionRecords = []
  for (const p of permissionData) {
    permissionRecords.push(await prisma.permission.create({ data: p }))
  }
  const permissionByName = new Map(permissionRecords.map((p) => [p.name, p.id]))
  console.log(`  ${permissionRecords.length} permissions created`)

  const roleData = [
    {
      name: 'Super Admin',
      description: 'Akses penuh ke semua fitur & pengaturan aplikasi',
      permissions: permissionData.map((p) => p.name),
    },
    {
      name: 'Sekretariat',
      description: 'Mengelola data & melihat seluruh tim (scope global)',
      permissions: [
        'dashboard:read',
        'aspirasi:read',
        'aspirasi:write',
        'kunjungan:read',
        'kunjungan:write',
        'relawan:read',
        'relawan:write',
        'pengaturan:read',
        'rbac:read',
        'teams:read',
        'dprd:read',
      ],
    },
    {
      name: 'Admin DPRD',
      description: 'Mengelola data aspirasi, kunjungan, dan relawan',
      permissions: [
        'dashboard:read',
        'aspirasi:read',
        'aspirasi:write',
        'aspirasi:delete',
        'kunjungan:read',
        'kunjungan:write',
        'kunjungan:delete',
        'relawan:read',
        'relawan:write',
        'relawan:delete',
        'pengaturan:read',
      ],
    },
    {
      name: 'User',
      description: 'User biasa yang hanya input data',
      permissions: [
        'dashboard:read',
        'aspirasi:read',
        'aspirasi:write',
        'kunjungan:read',
        'kunjungan:write',
        'relawan:read',
        'relawan:write',
      ],
    },
  ]

  const roleByName = new Map<string, string>()
  for (const r of roleData) {
    const role = await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
        permissions: {
          create: r.permissions.map((name) => ({ permissionId: permissionByName.get(name)! })),
        },
      },
    })
    roleByName.set(r.name, role.id)
  }
  console.log(`  ${roleData.length} roles created`)

  // 7. Hubungkan user admin ke role Admin DPRD, superadmin ke Super Admin
  const adminDprdRoleId = roleByName.get('Admin DPRD')
  const adminUser = await prisma.user.findUnique({ where: { username: 'admin' } })
  if (adminUser && adminDprdRoleId) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role_id: adminDprdRoleId },
    })
  }
  const superAdminRoleId = roleByName.get('Super Admin')
  const superAdminUser = await prisma.user.findUnique({ where: { username: 'superadmin' } })
  if (superAdminUser && superAdminRoleId) {
    await prisma.user.update({
      where: { id: superAdminUser.id },
      data: { role_id: superAdminRoleId },
    })
  }
  console.log('  admin → Admin DPRD, superadmin → Super Admin')

  console.log('Seeding complete successfully!')
}

main()
  .then(async () => {
    await pool.end()
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Seeding error:', e)
    await pool.end()
    await prisma.$disconnect()
    process.exit(1)
  })