-- DropForeignKey
ALTER TABLE "abac_policies" DROP CONSTRAINT "abac_policies_role_id_fkey";

-- DropTable
DROP TABLE "abac_policies";

-- DropEnum
DROP TYPE "PolicyEffect";
