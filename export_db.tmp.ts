import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './src/generated/prisma/client'
import { Pool } from 'pg'
import { writeFileSync } from 'fs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
  }

  data.kotas = await prisma.kota.findMany()
  data.kecamatans = await prisma.kecamatan.findMany()
  data.kelurahans = await prisma.kelurahan.findMany()
  data.dprds = await prisma.dprd.findMany()
  data.teams = await prisma.team.findMany()
  data.users = await prisma.user.findMany()
  data.userTeams = await prisma.userTeam.findMany()
  data.permissions = await prisma.permission.findMany()
  data.roles = await prisma.role.findMany()
  data.rolePermissions = await prisma.rolePermission.findMany()
  data.kunjungans = await prisma.kunjungan.findMany()
  data.kegiatans = await prisma.kegiatan.findMany()
  data.aspirasis = await prisma.aspirasis.findMany()
  data.trackingAspirasis = await prisma.trackingAspirasi.findMany()
  data.relawans = await prisma.relawan.findMany()

  const summary: Record<string, number> = {}
  for (const [key, rows] of Object.entries(data)) {
    if (Array.isArray(rows)) summary[key] = rows.length
  }
  data.summary = summary

  const outPath = 'database-export.json'
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8')
  console.log('Exported to', outPath)
  console.log(JSON.stringify(summary, null, 2))
}

main().finally(async () => {
  await pool.end()
  await prisma.$disconnect()
})
