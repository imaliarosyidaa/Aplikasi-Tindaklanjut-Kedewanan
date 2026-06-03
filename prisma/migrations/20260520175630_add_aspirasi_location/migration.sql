/*
  Warnings:

  - Added the required column `kecamatan` to the `aspirasis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kelurahan` to the `aspirasis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasi` to the `aspirasis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "aspirasis" ADD COLUMN     "kecamatan" TEXT NOT NULL,
ADD COLUMN     "kelurahan" TEXT NOT NULL,
ADD COLUMN     "lokasi" TEXT NOT NULL;
