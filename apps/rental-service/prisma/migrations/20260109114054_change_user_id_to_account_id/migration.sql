/*
  Warnings:

  - You are about to drop the column `userId` on the `rentals` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `reservations` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `rentals` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountId` to the `reservations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `rentals` DROP COLUMN `userId`,
    ADD COLUMN `accountId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `reservations` DROP COLUMN `userId`,
    ADD COLUMN `accountId` VARCHAR(191) NOT NULL;
