-- CreateEnum
CREATE TYPE "UserVerifyStatus" AS ENUM ('Unverified', 'Verified', 'Banned');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'STAFF', 'SOS');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "YOB" INTEGER NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "verify" "UserVerifyStatus" NOT NULL DEFAULT 'Unverified',
    "nfcCardUid" TEXT DEFAULT '',
    "avatarUrl" TEXT DEFAULT '',
    "status" "UserStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_accountId_key" ON "profiles"("accountId");
