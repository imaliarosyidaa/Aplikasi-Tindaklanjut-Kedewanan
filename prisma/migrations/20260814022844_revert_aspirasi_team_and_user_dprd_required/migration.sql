/*
  Warnings:

  - You are about to drop the column `team_id` on the `aspirasis` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "aspirasis" DROP CONSTRAINT "aspirasis_team_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_dprd_id_fkey";

-- AlterTable
ALTER TABLE "aspirasis" DROP COLUMN "team_id";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "dprd_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_dprd_id_fkey" FOREIGN KEY ("dprd_id") REFERENCES "dprds"("id") ON DELETE SET NULL ON UPDATE CASCADE;
