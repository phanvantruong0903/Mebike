/*
  Warnings:

  - The values [Cancelled,Reserved] on the enum `rentals_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `rentals` MODIFY `status` ENUM('Rented', 'Completed') NOT NULL DEFAULT 'Rented';
