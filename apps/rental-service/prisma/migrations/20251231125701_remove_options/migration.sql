/*
  Warnings:

  - You are about to drop the column `fixed_slot_template_id` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `reservation_option` on the `reservations` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `reservations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `reservations` DROP COLUMN `fixed_slot_template_id`,
    DROP COLUMN `reservation_option`,
    DROP COLUMN `subscriptionId`;
