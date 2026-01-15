/*
  Warnings:

  - Made the column `endTime` on table `reservations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `reservations` MODIFY `endTime` DATETIME(3) NOT NULL;
