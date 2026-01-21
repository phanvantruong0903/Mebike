-- AlterEnum
ALTER TYPE "EmergencyStatus" ADD VALUE 'Unsolvable';

-- AlterTable
ALTER TABLE "emergency_requests" ADD COLUMN     "resolvedPhotos" TEXT[] DEFAULT ARRAY[]::TEXT[];
