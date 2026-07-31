import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts', // Ditambahkan 'npx tsx' agar file .ts bisa berjalan
  },
  datasource: {
    // Diganti ke postgresql dan port 5432 sesuai stack Laragon PostgreSQL kamu
    url: process.env['DATABASE_URL'] ?? 'postgresql://postgres:@localhost:5432/kunjungan_tracker?schema=public',
  },
})