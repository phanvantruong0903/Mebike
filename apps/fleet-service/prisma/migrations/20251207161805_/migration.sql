-- CreateEnum
CREATE TYPE "SupplierStatus" AS ENUM ('Active', 'Inactive');

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL,
    "contractFee" DECIMAL(8,4) NOT NULL,
    "status" "SupplierStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);
