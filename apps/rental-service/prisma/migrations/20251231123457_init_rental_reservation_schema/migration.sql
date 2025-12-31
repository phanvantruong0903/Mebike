-- CreateTable
CREATE TABLE `rentals` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bikeId` VARCHAR(191) NULL,
    `startStation` VARCHAR(191) NOT NULL,
    `endStation` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NOT NULL DEFAULT 0,
    `totalPrice` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `subscriptionId` VARCHAR(191) NULL,
    `status` ENUM('Rented', 'Completed', 'Cancelled', 'Reserved') NOT NULL DEFAULT 'Rented',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bikeId` VARCHAR(191) NULL,
    `station_id` VARCHAR(191) NOT NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `prepaid` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `status` ENUM('Pending', 'Active', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Pending',
    `reservation_option` ENUM('ONE_TIME', 'FIXED_SLOT', 'SUBSCRIPTION') NOT NULL DEFAULT 'ONE_TIME',
    `subscriptionId` VARCHAR(191) NULL,
    `fixed_slot_template_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
