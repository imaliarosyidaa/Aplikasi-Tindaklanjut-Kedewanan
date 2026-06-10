-- Drop all existing foreign key constraints
ALTER TABLE IF EXISTS "kelurahans" DROP CONSTRAINT IF EXISTS "kelurahans_kecamatan_id_fkey";
ALTER TABLE IF EXISTS "kunjungans" DROP CONSTRAINT IF EXISTS "kunjungans_kelurahan_id_fkey";
ALTER TABLE IF EXISTS "kunjungans" DROP CONSTRAINT IF EXISTS "kunjungans_kecamatan_id_fkey";
ALTER TABLE IF EXISTS "aspirasis" DROP CONSTRAINT IF EXISTS "aspirasis_user_id_fkey";
ALTER TABLE IF EXISTS "kegiatans" DROP CONSTRAINT IF EXISTS "kegiatans_kunjungan_id_fkey";

-- Drop all existing tables
DROP TABLE IF EXISTS "kegiatans" CASCADE;
DROP TABLE IF EXISTS "aspirasis" CASCADE;
DROP TABLE IF EXISTS "relawans" CASCADE;
DROP TABLE IF EXISTS "kunjungans" CASCADE;
DROP TABLE IF EXISTS "kelurahans" CASCADE;
DROP TABLE IF EXISTS "kecamatans" CASCADE;
DROP TABLE IF EXISTS "kotas" CASCADE;
DROP TABLE IF EXISTS "_KelurahanToKota" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- CreateEnum (if not exists)
DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "AspirasiStatus" AS ENUM ('BELUM_DITINDAKLANJUTI', 'SEDANG_DITINDAKLANJUTI', 'SUDAH_DITINDAKLANJUTI', 'TIDAK_BISA_DITINDAKLANJUTI');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "SumberAspirasi" AS ENUM ('LEMBAR_ASPIRASI_RESES', 'LEMBAR_ASPIRASI_SOSPERDA', 'ASPIRASI_PROPOSAL_LANGSUNG', 'KOORDINASI_DINAS_TERKAIT', 'USULAN_MUSRENBANG_DEWAN', 'CALL_CENTER');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PosisiRelawan" AS ENUM ('KOORDINATOR_RW', 'KOORDINATOR_RT', 'KOORDINATOR_KELURAHAN', 'KOORDINATOR_KECAMATAN', 'FKDM', 'LMK', 'TOKOH_MASYARAKAT', 'PROFESIONAL');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- CreateTable users
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable kotas
CREATE TABLE "kotas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nama" TEXT NOT NULL,
    CONSTRAINT "kotas_pkey" PRIMARY KEY ("id")
);

-- CreateTable kecamatans
CREATE TABLE "kecamatans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kota_id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    CONSTRAINT "kecamatans_pkey" PRIMARY KEY ("id")
);

-- CreateTable kelurahans
CREATE TABLE "kelurahans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "kecamatan_id" UUID NOT NULL,
    "nama" TEXT NOT NULL,
    CONSTRAINT "kelurahans_pkey" PRIMARY KEY ("id")
);

-- CreateTable kunjungans
CREATE TABLE "kunjungans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam" TEXT NOT NULL,
    "jalan" TEXT NOT NULL,
    "kelurahan_id" UUID NOT NULL,
    "kecamatan_id" UUID NOT NULL,
    "kota_id" UUID NOT NULL,
    "link_gmaps" TEXT DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "kunjungans_pkey" PRIMARY KEY ("id")
);

-- CreateTable aspirasis
CREATE TABLE "aspirasis" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nik" TEXT DEFAULT '',
    "sumber" "SumberAspirasi" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "status" "AspirasiStatus" NOT NULL,
    "pelapor_nama" TEXT NOT NULL,
    "pelapor_email" TEXT DEFAULT '',
    "pelapor_telepon" TEXT NOT NULL,
    "lampiran" JSONB DEFAULT '[]',
    "bukti_tindak_lanjut" JSONB DEFAULT '[]',
    "catatan_tindak_lanjut" TEXT DEFAULT '',
    "kategori_usulan" TEXT NOT NULL,
    "jenis_usulan" TEXT NOT NULL,
    "jenis_reses" TEXT NOT NULL,
    "tindak_lanjut" TEXT NOT NULL,
    "tanggal_dibuat" TIMESTAMP(3) NOT NULL,
    "kota_id" UUID,
    "kecamatan_id" UUID,
    "kelurahan_id" UUID,
    "alamat" TEXT,
    "user_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "aspirasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable relawans
CREATE TABLE "relawans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nik" TEXT,
    "nama" TEXT NOT NULL,
    "no_telepon" TEXT,
    "jenis_kelamin" "JenisKelamin" NOT NULL,
    "alamat" TEXT NOT NULL,
    "posisi" "PosisiRelawan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "kota_id" UUID NOT NULL,
    "kecamatan_id" UUID NOT NULL,
    "kelurahan_id" UUID NOT NULL,
    CONSTRAINT "relawans_pkey" PRIMARY KEY ("id")
);

-- CreateTable kegiatans
CREATE TABLE "kegiatans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "jenis_kegiatan" TEXT NOT NULL DEFAULT '',
    "kunjungan_id" UUID NOT NULL,
    "isi" TEXT,
    "hari" TEXT,
    "tanggal" TIMESTAMP(3),
    "foto" TEXT,
    "nama_kegiatan" TEXT NOT NULL,
    "link_gmaps" TEXT,
    "tempat" TEXT,
    "alamat" TEXT,
    "rt" TEXT,
    "rw" TEXT,
    "jumlah_peserta" INTEGER,
    "catatan" TEXT,
    CONSTRAINT "kegiatans_pkey" PRIMARY KEY ("id")
);

-- CreateTable _KelurahanToKota (implicit M:N relation)
CREATE TABLE "_KelurahanToKota" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,
    CONSTRAINT "_KelurahanToKota_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndexes
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "kotas_nama_key" ON "kotas"("nama");
CREATE UNIQUE INDEX "kecamatans_nama_key" ON "kecamatans"("nama");
CREATE UNIQUE INDEX "relawans_nik_key" ON "relawans"("nik");
CREATE INDEX "_KelurahanToKota_B_index" ON "_KelurahanToKota"("B");

-- AddForeignKey
ALTER TABLE "kecamatans" ADD CONSTRAINT "kecamatans_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelurahans" ADD CONSTRAINT "kelurahans_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunjungans" ADD CONSTRAINT "kunjungans_kelurahan_id_fkey" FOREIGN KEY ("kelurahan_id") REFERENCES "kelurahans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunjungans" ADD CONSTRAINT "kunjungans_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunjungans" ADD CONSTRAINT "kunjungans_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_kelurahan_id_fkey" FOREIGN KEY ("kelurahan_id") REFERENCES "kelurahans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawans" ADD CONSTRAINT "relawans_kota_id_fkey" FOREIGN KEY ("kota_id") REFERENCES "kotas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawans" ADD CONSTRAINT "relawans_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relawans" ADD CONSTRAINT "relawans_kelurahan_id_fkey" FOREIGN KEY ("kelurahan_id") REFERENCES "kelurahans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatans" ADD CONSTRAINT "kegiatans_kunjungan_id_fkey" FOREIGN KEY ("kunjungan_id") REFERENCES "kunjungans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KelurahanToKota" ADD CONSTRAINT "_KelurahanToKota_A_fkey" FOREIGN KEY ("A") REFERENCES "kelurahans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_KelurahanToKota" ADD CONSTRAINT "_KelurahanToKota_B_fkey" FOREIGN KEY ("B") REFERENCES "kotas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
