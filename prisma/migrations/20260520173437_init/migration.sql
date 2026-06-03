-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "AspirasiStatus" AS ENUM ('BELUM_DITINDAKLANJUTI', 'SEDANG_DITINDAKLANJUTI', 'SUDAH_DITINDAKLANJUTI');

-- CreateEnum
CREATE TYPE "SumberAspirasi" AS ENUM ('LEMBAR_ASPIRASI_RESES', 'LEMBAR_ASPIRASI_SOSPERDA', 'ASPIRASI_PROPOSAL_LANGSUNG', 'KOORDINASI_DINAS_TERKAIT', 'USULAN_MUSRENBANG_DEWAN', 'CALL_CENTER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kecamatans" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "kecamatans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelurahans" (
    "id" TEXT NOT NULL,
    "kecamatan_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "kelurahans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kunjungans" (
    "id" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jam" TEXT NOT NULL,
    "jalan" TEXT NOT NULL,
    "kelurahan_id" TEXT NOT NULL,
    "kecamatan_id" TEXT NOT NULL,
    "kota" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kunjungans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aspirasis" (
    "id" TEXT NOT NULL,
    "sumber" "SumberAspirasi" NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "status" "AspirasiStatus" NOT NULL,
    "pelapor_nama" TEXT NOT NULL,
    "pelapor_email" TEXT NOT NULL,
    "pelapor_telepon" TEXT NOT NULL,
    "lampiran" JSONB NOT NULL DEFAULT '[]',
    "bukti_tindak_lanjut" JSONB NOT NULL DEFAULT '[]',
    "catatan_tindak_lanjut" TEXT NOT NULL DEFAULT '',
    "kategori_usulan" TEXT NOT NULL,
    "jenis_usulan" TEXT NOT NULL,
    "jenis_reses" TEXT NOT NULL,
    "tindak_lanjut" TEXT NOT NULL,
    "tanggal_dibuat" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aspirasis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kegiatans" (
    "id" TEXT NOT NULL,
    "kunjungan_id" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "foto" TEXT NOT NULL,
    "jenis_kegiatan" TEXT NOT NULL,
    "nama_kegiatan" TEXT NOT NULL,
    "link_gmaps" TEXT NOT NULL,
    "rt" TEXT NOT NULL,
    "rw" TEXT NOT NULL,
    "jumlah_peserta" INTEGER NOT NULL,
    "catatan" TEXT NOT NULL,

    CONSTRAINT "kegiatans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "kecamatans_nama_key" ON "kecamatans"("nama");

-- AddForeignKey
ALTER TABLE "kelurahans" ADD CONSTRAINT "kelurahans_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunjungans" ADD CONSTRAINT "kunjungans_kelurahan_id_fkey" FOREIGN KEY ("kelurahan_id") REFERENCES "kelurahans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kunjungans" ADD CONSTRAINT "kunjungans_kecamatan_id_fkey" FOREIGN KEY ("kecamatan_id") REFERENCES "kecamatans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aspirasis" ADD CONSTRAINT "aspirasis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kegiatans" ADD CONSTRAINT "kegiatans_kunjungan_id_fkey" FOREIGN KEY ("kunjungan_id") REFERENCES "kunjungans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
