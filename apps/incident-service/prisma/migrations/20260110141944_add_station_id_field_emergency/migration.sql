/*
  Warnings:

  - Added the required column `stationId` to the `emergency_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "emergency_requests" ADD COLUMN     "stationId" UUID NOT NULL;
