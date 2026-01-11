-- Add endStationId and startStationId (nullable)
ALTER TABLE `rentals` 
    ADD COLUMN `endStationId` VARCHAR(191) NULL,
    ADD COLUMN `startStationId` VARCHAR(191) NULL;

-- Backfill data (need to adjust logic based on old data structure)
UPDATE `rentals` SET `startStationId` = `startStation`;
UPDATE `rentals` SET `endStationId` = `endStation`;

-- Make NOT NULL constraint (after backfill)
ALTER TABLE `rentals` 
    MODIFY COLUMN `startStationId` VARCHAR(191) NOT NULL;

-- Drop old columns
ALTER TABLE `rentals` 
    DROP COLUMN `endStation`,
    DROP COLUMN `startStation`;