-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('Assigned', 'Processing', 'Resolved', 'Cancelled');

-- CreateTable
CREATE TABLE "emergency_requests" (
    "id" TEXT NOT NULL,
    "rentalId" UUID NOT NULL,
    "requesterId" UUID NOT NULL,
    "bikeId" UUID NOT NULL,
    "issue" TEXT NOT NULL,
    "photos" TEXT[],
    "isContinuingRental" BOOLEAN NOT NULL DEFAULT false,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "agentId" UUID NOT NULL,
    "agentNotes" TEXT,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'Assigned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_requests_pkey" PRIMARY KEY ("id")
);
