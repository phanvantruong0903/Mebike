-- CreateEnum
CREATE TYPE "StationStatus" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "stations" ADD COLUMN     "status" "StationStatus" NOT NULL DEFAULT 'Active';
