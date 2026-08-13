/*
  Warnings:

  - The `lampiran` column on the `aspirasis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `foto` column on the `kegiatans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `lampiran` column on the `tracking_aspirasis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "aspirasis" DROP COLUMN "lampiran",
ADD COLUMN     "lampiran" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "kegiatans" DROP COLUMN "foto",
ADD COLUMN     "foto" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "tracking_aspirasis" DROP COLUMN "lampiran",
ADD COLUMN     "lampiran" TEXT[] DEFAULT ARRAY[]::TEXT[];
