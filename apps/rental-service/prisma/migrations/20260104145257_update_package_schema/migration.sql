/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `packages` ADD COLUMN `usageType` ENUM('Finite', 'Infinite') NOT NULL DEFAULT 'Finite';

-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `expiresAt`,
    ADD COLUMN `expiredAt` DATETIME(3) NULL;
