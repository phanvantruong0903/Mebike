/*
  Warnings:

  - You are about to drop the column `userId` on the `subscriptions` table. All the data in the column will be lost.
  - Added the required column `accountId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `subscriptions` DROP COLUMN `userId`,
    ADD COLUMN `accountId` VARCHAR(191) NOT NULL;
