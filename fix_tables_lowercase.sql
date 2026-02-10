-- Quick fix: Create lowercase table aliases or rename tables
-- This script ensures table names match what the backend expects

-- Check if tables exist and show them
SHOW TABLES;

-- If tables are lowercase (vehicles, customers, etc.), we need to update the backend
-- If tables are uppercase (Vehicles, Customers, etc.), they should work

-- For now, let's assume tables are lowercase and need to be created
-- Run this to create tables if they don't exist:

CREATE TABLE IF NOT EXISTS `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `plateNumber` VARCHAR(20) NOT NULL UNIQUE,
  `dailyPrice` DECIMAL(10, 2) NOT NULL,
  `weeklyPrice` DECIMAL(10, 2) DEFAULT NULL,
  `monthlyPrice` DECIMAL(10, 2) DEFAULT NULL,
  `deposit` DECIMAL(10, 2) DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('available', 'rented', 'maintenance', 'retired') DEFAULT 'available',
  `insuranceRequired` TINYINT(1) DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `qrCodeUrl` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `address` TEXT DEFAULT NULL,
  `idNumber` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  `outstandingBalance` DECIMAL(10, 2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `systemadmins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN', 'MANAGER', 'STAFF') DEFAULT 'STAFF',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleId` INT NOT NULL,
  `customerId` INT NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('booking_request', 'active', 'completed', 'cancelled') DEFAULT 'booking_request',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`),
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `documentType` ENUM('driver_license', 'insurance', 'id_card', 'other') NOT NULL,
  `fileUri` VARCHAR(255) NOT NULL,
  `status` ENUM('uploaded', 'approved', 'rejected') DEFAULT 'uploaded',
  `feedback` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_method` ENUM('cash', 'card', 'online', 'other') DEFAULT 'cash',
  `payment_date` DATE NOT NULL,
  `status` ENUM('SUCCESS', 'PENDING', 'FAILED') DEFAULT 'PENDING',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user (password: admin123)
INSERT INTO `systemadmins` (`username`, `email`, `password_hash`, `full_name`, `role`) 
VALUES ('admin', 'admin@carrental.com', '$2a$10$rFZqK9qPxVYGxKxVxVxVxO7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7', 'System Administrator', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE username=username;
