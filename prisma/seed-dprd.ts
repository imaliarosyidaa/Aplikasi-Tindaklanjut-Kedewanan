import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'

// Inisialisasi Pool PG untuk koneksi stabil
const connectionString = process.env.DATABASE_URL!
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEFAULT_DPRDS = [
  {
    name: 'Hj. Yuke Yurike, ST, MM',
    description: 'Anggota DPRD Kota Jakarta Selatan - Dapil Jakarta Selatan 2',
  },
]

async function main() {
  console.log('Seeding default DPRD...')

  for (const d of DEFAULT_DPRDS) {
    await prisma.dprd.upsert({
      where: { name: d.name },
      update: { description: d.description, is_active: true },
      create: { name: d.name, description: d.description, is_active: true },
    })
    console.log(`  DPRD "${d.name}" upserted`)
  }

  console.log('Seeding default DPRD complete!')
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
