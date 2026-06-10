-- DropForeignKey
ALTER TABLE "aspirasis" DROP CONSTRAINT "aspirasis_kecamatan_id_fkey";

-- DropForeignKey
ALTER TABLE "aspirasis" DROP CONSTRAINT "aspirasis_kelurahan_id_fkey";

-- DropForeignKey
ALTER TABLE "aspirasis" DROP CONSTRAINT "aspirasis_kota_id_fkey";

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kotas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kelurahan_id_fkey" FOREIGN KEY ("kelurahan_id") REFERENCES "kelurahans"("id") ON DELETE SET NULL ON UPDATE CASCADE;
