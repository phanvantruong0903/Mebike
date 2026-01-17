-- 1. Add Completed status
ALTER TABLE reservations MODIFY COLUMN status ENUM('Pending', 'Active', 'Completed', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Pending';

-- 2. Update Active reservation to Completed
UPDATE reservations SET status = 'Completed' WHERE status = 'Active';

-- 3. Remove Active status
ALTER TABLE reservations MODIFY COLUMN status ENUM('Pending', 'Completed', 'Cancelled', 'Expired') NOT NULL DEFAULT 'Pending';