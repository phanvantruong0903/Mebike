/*
  Warnings:

  - You are about to drop the column `endStation` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `startStation` on the `rentals` table. All the data in the column will be lost.
  - Added the required column `startStationId` to the `rentals` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rentals` DROP COLUMN `endStation`,
    DROP COLUMN `startStation`,
    ADD COLUMN `endStationId` VARCHAR(191) NULL,
    ADD COLUMN `startStationId` VARCHAR(191) NOT NULL;
