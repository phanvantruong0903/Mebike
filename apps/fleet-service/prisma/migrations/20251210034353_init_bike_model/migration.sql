-- CreateEnum
CREATE TYPE "BikeStatus" AS ENUM ('Available', 'Booked', 'Broken', 'Reserved', 'Maintained', 'Unavailable');

-- CreateTable
CREATE TABLE "bikes" (
    "id" TEXT NOT NULL,
    "chipId" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "status" "BikeStatus" NOT NULL DEFAULT 'Available',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bikes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
