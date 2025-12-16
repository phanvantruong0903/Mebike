-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SOS';

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "avatarUrl" TEXT DEFAULT '',
ADD COLUMN     "nfcCardUid" TEXT DEFAULT '';
