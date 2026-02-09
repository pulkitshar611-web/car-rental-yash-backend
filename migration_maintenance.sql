-- Create Maintenance Table
CREATE TABLE IF NOT EXISTS `Maintenance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleId` INT NOT NULL,
  `reason` VARCHAR(50) NOT NULL, -- e.g. repair, accident, inspection
  `description` TEXT,
  `cost` DECIMAL(10, 2) DEFAULT 0.00,
  `status` ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'in_progress',
  `serviceDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_maintenance_vehicle` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
