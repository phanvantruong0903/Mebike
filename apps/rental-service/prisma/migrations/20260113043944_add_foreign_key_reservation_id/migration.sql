/*
  Warnings:

  - You are about to alter the column `totalPrice` on the `rentals` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `prepaid` on the `reservations` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[reservationId]` on the table `rentals` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `rentals` ADD COLUMN `reservationId` VARCHAR(191) NULL,
    MODIFY `totalPrice` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `reservations` MODIFY `prepaid` DECIMAL(10, 2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `rentals_reservationId_key` ON `rentals`(`reservationId`);

-- AddForeignKey
ALTER TABLE `rentals` ADD CONSTRAINT `rentals_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `reservations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
