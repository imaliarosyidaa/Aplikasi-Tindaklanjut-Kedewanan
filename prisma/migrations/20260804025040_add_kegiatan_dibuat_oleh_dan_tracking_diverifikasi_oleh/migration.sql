-- AlterTable
ALTER TABLE "kegiatans" ADD COLUMN     "dibuat_oleh_id" UUID;

-- AlterTable
ALTER TABLE "tracking_aspirasis" ADD COLUMN     "diverifikasi_oleh_id" UUID;

-- AddForeignKey
ALTER TABLE "tracking_aspirasis" ADD CONSTRAINT "tracking_aspirasis_diverifikasi_oleh_id_fkey" FOREIGN KEY ("diverifikasi_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatans" ADD CONSTRAINT "kegiatans_dibuat_oleh_id_fkey" FOREIGN KEY ("dibuat_oleh_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
