-- AlterTable
-- Kolom pernah dibuat sebagai TEXT (gagal). DROP dulu agar tipe UUID dan FK bisa dibuat konsisten.
ALTER TABLE "aspirasis" DROP COLUMN IF EXISTS "master_dewan";
ALTER TABLE "aspirasis" ADD COLUMN     "master_dewan" UUID;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_master_dewan_fkey" FOREIGN KEY ("master_dewan") REFERENCES "dprds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
