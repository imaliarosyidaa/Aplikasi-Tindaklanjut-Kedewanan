import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts', // Ditambahkan 'npx tsx' agar file .ts bisa berjalan
  },
  datasource: {
    // Migrasi pakai DIRECT_URL (session pooler :5432), bukan transaction pooler (:6543)
    url: process.env['DIRECT_URL'] ?? process.env['DATABASE_URL'] ?? 'postgresql://postgres:@localhost:5432/kunjungan_tracker?schema=public',
  },
})