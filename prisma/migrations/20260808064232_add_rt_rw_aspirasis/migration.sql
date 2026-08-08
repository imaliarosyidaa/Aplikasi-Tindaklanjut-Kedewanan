-- AlterTable
ALTER TABLE "aspirasis" ADD COLUMN     "rt" TEXT,
ADD COLUMN     "rw" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin';
