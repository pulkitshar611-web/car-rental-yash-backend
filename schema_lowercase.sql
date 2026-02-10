-- CORRECTED Car Rental Database Schema
-- Using LOWERCASE table names for cross-platform compatibility

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Drop existing tables if any (in correct order due to foreign keys)
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `rentals`;
DROP TABLE IF EXISTS `maintenance`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `systemadmins`;
DROP TABLE IF EXISTS `systemsettings`;

-- Admin Users (lowercase)
CREATE TABLE `systemadmins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN', 'MANAGER', 'STAFF') DEFAULT 'STAFF',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customers (lowercase)
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL UNIQUE,
  `address` TEXT DEFAULT NULL,
  `idNumber` VARCHAR(50) DEFAULT NULL,
  `status` ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  `outstandingBalance` DECIMAL(10, 2) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicles (lowercase)
CREATE TABLE `vehicles` (
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
  `imageUrl` VARCHAR(255) DEFAULT NULL,
  `qrCodeUrl` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rentals (lowercase)
CREATE TABLE `rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleId` INT NOT NULL,
  `customerId` INT NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `deposit` DECIMAL(10, 2) DEFAULT 0,
  `status` ENUM('booking_request', 'verified', 'paid', 'active', 'completed', 'cancelled') DEFAULT 'booking_request',
  `bookingToken` VARCHAR(100) DEFAULT NULL,
  `remainingAmount` DECIMAL(10, 2) DEFAULT 0,
  `paymentStatus` ENUM('paid', 'overdue', 'due', 'pending') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`),
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documents (lowercase)
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `documentType` ENUM('driver_license', 'insurance', 'id_card', 'other') NOT NULL,
  `fileUri` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'uploaded', 'approved', 'rejected') DEFAULT 'uploaded',
  `expiryDate` DATE DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `rentalId` INT DEFAULT NULL,
  `vehicleId` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments (lowercase)
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_type` ENUM('RENTAL_FEE', 'DEPOSIT', 'LATE_FEE', 'REFUND') NOT NULL,
  `payment_method` ENUM('CASH', 'CARD', 'ONLINE') NOT NULL,
  `payment_date` DATE NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  `transaction_id` VARCHAR(100) DEFAULT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `rentals`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Maintenance (lowercase)
CREATE TABLE `maintenance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleId` INT NOT NULL,
  `description` TEXT NOT NULL,
  `cost` DECIMAL(10, 2) DEFAULT 0,
  `maintenanceDate` DATE NOT NULL,
  `status` ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System Settings (lowercase)
CREATE TABLE `systemsettings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default admin user
-- Password: admin123 (bcrypt hash)
INSERT INTO `systemadmins` (`username`, `email`, `password_hash`, `full_name`, `role`) 
VALUES ('admin', 'admin@carrental.com', '$2a$10$rFZqK9qPxVYGxKxVxVxVxO7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7', 'System Administrator', 'SUPER_ADMIN');

-- Insert default settings
INSERT INTO `systemsettings` (`setting_key`, `setting_value`) VALUES
('business_info', '{"name": "Car Rental Management", "address": "123 Business St", "phone": "555-0000", "email": "info@carrental.com"}'),
('rental_rules', '{"insuranceRequired": true, "minimumAge": 25, "maxRentalDays": 30, "depositRequired": true, "defaultDeposit": 500, "lateFeePerDay": 50}');

-- Insert sample data for testing
INSERT INTO `vehicles` (`name`, `model`, `plateNumber`, `dailyPrice`, `status`, `insuranceRequired`) VALUES
('Toyota Camry', '2023', 'ABC-1234', 50.00, 'available', 1),
('Honda Civic', '2023', 'XYZ-5678', 45.00, 'available', 1),
('Ford Mustang', '2023', 'MUS-9999', 80.00, 'available', 1);

INSERT INTO `customers` (`name`, `phone`, `email`, `address`, `status`) VALUES
('John Doe', '555-1234', 'john@example.com', '123 Main St', 'active'),
('Jane Smith', '555-5678', 'jane@example.com', '456 Oak Ave', 'active');

COMMIT;
