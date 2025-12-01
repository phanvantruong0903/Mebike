-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'Active';
