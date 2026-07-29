import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'] ?? 'mysql://root:@localhost:3306/aspirasi_dprd',
  },
})
