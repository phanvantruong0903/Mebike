-- Add accountId as nullable
ALTER TABLE `rentals` ADD COLUMN `accountId` VARCHAR(191);
ALTER TABLE `reservations` ADD COLUMN `accountId` VARCHAR(191);

-- Copy data
UPDATE `rentals` SET `accountId` = `userId`;
UPDATE `reservations` SET `accountId` = `userId`;

-- Make NOT NULL
ALTER TABLE `rentals` MODIFY COLUMN `accountId` VARCHAR(191) NOT NULL;
ALTER TABLE `reservations` MODIFY COLUMN `accountId` VARCHAR(191) NOT NULL;

-- Drop old column
ALTER TABLE `rentals` DROP COLUMN `userId`;
ALTER TABLE `reservations` DROP COLUMN `userId`;
