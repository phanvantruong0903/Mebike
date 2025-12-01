-- CreateEnum
CREATE TYPE "WarehouseStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN     "status" "WarehouseStatus" NOT NULL DEFAULT 'ACTIVE';
