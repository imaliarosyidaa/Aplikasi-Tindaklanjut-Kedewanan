/*
  Warnings:

  - Made the column `dprd_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_dprd_id_fkey";

-- AlterTable
ALTER TABLE "aspirasis" ADD COLUMN     "team_id" UUID;

-- Backfill: pastikan DPRD default tersedia, lalu hubungkan semua user
-- yang belum punya dprd_id sebelum kolom dijadikan NOT NULL.
INSERT INTO "dprds" ("id", "name", "description", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), 'Hj. Yuke Yurike, ST, MM', 'Anggota DPRD Kota Jakarta Selatan - Dapil Jakarta Selatan 2', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "dprds" WHERE "name" = 'Hj. Yuke Yurike, ST, MM');

UPDATE "users"
SET "dprd_id" = (SELECT "id" FROM "dprds" WHERE "name" = 'Hj. Yuke Yurike, ST, MM' LIMIT 1)
WHERE "dprd_id" IS NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dprd_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_dprd_id_fkey" FOREIGN KEY ("dprd_id") REFERENCES "dprds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
