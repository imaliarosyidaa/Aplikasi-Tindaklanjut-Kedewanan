-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "PosisiRelawan" AS ENUM ('KOORDINATOR_RW', 'KOORDINATOR_RT', 'KOORDINATOR_KELURAHAN', 'KOORDINATOR_KECAMATAN', 'FKDM', 'LMK', 'TOKOH_MASYARAKAT', 'PROFESIONAL');

-- AlterEnum
ALTER TYPE "AspirasiStatus" ADD VALUE 'TIDAK_BISA_DITINDAKLANJUTI';

-- AlterTable
ALTER TABLE "aspirasis" ADD COLUMN     "kota" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nik" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "kecamatan" SET DEFAULT '',
ALTER COLUMN "kelurahan" SET DEFAULT '',
ALTER COLUMN "lokasi" SET DEFAULT '';

-- AlterTable
ALTER TABLE "kunjungans" ADD COLUMN     "jenis_kegiatan" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "link_gmaps" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "relawans" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "no_telepon" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "kota_kabupaten" TEXT NOT NULL,
    "kecamatan" TEXT NOT NULL,
    "kelurahan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "posisi" "PosisiRelawan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relawans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "relawans_nik_key" ON "relawans"("nik");
