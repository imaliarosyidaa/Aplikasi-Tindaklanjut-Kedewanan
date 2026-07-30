/*
  Warnings:

  - You are about to alter the column `sumber` on the `aspirasis` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `aspirasis` MODIFY `sumber` VARCHAR(191) NULL;
