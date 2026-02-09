-- Car Rental Management System - Unified Database Schema
-- Updated to match Controller expectations (camelCase)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Admin Users
CREATE TABLE IF NOT EXISTS `SystemAdmins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('SUPER_ADMIN', 'MANAGER', 'STAFF') DEFAULT 'STAFF',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Customers
CREATE TABLE IF NOT EXISTS `Customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `address` TEXT DEFAULT NULL,
  `id_number` VARCHAR(50) DEFAULT NULL,
  `otp_code` VARCHAR(6) DEFAULT NULL,
  `otp_expiry` TIMESTAMP NULL DEFAULT NULL,
  `is_verified` TINYINT(1) DEFAULT 0,
  `status` ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vehicles
CREATE TABLE IF NOT EXISTS `Vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `plateNumber` VARCHAR(20) NOT NULL UNIQUE,
  `dailyPrice` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('available', 'rented', 'maintenance', 'retired') DEFAULT 'available',
  `insuranceRequired` TINYINT(1) DEFAULT 0,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `qrCodeUrl` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Rentals
CREATE TABLE IF NOT EXISTS `Rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `vehicleId` INT NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('booking_request', 'verified', 'paid', 'active', 'completed', 'cancelled') DEFAULT 'booking_request',
  `bookingToken` VARCHAR(100) DEFAULT NULL,
  `remainingAmount` DECIMAL(10, 2) DEFAULT 0,
  `paymentStatus` ENUM('paid', 'overdue', 'due', 'pending') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT `fk_rental_customer` FOREIGN KEY (`customerId`) REFERENCES `Customers`(`id`),
  CONSTRAINT `fk_rental_vehicle` FOREIGN KEY (`vehicleId`) REFERENCES `Vehicles`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Documents
CREATE TABLE IF NOT EXISTS `Documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `documentType` ENUM('driver_license', 'insurance', 'other') NOT NULL,
  `fileUri` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'uploaded', 'approved', 'rejected') DEFAULT 'pending',
  `expiryDate` DATE DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `rentalId` INT DEFAULT NULL,
  `vehicleId` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_doc_customer` FOREIGN KEY (`customerId`) REFERENCES `Customers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Payments
CREATE TABLE IF NOT EXISTS `Payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_id` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `payment_type` ENUM('RENTAL_FEE', 'DEPOSIT', 'LATE_FEE', 'REFUND') NOT NULL,
  `payment_method` ENUM('CASH', 'CARD', 'ONLINE') NOT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  `transaction_id` VARCHAR(100) UNIQUE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_payment_rental` FOREIGN KEY (`rental_id`) REFERENCES `Rentals`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- System Settings
CREATE TABLE IF NOT EXISTS `SystemSettings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Settings
INSERT INTO `SystemSettings` (`setting_key`, `setting_value`) VALUES
('business_info', '{"name": "Car Rental Management", "address": "123 Business St, City", "phone": "555-0000", "email": "info@carrental.com", "taxId": "TAX-123456"}'),
('rental_rules', '{"insuranceRequired": true, "minimumAge": 25, "maxRentalDays": 30, "depositRequired": true, "defaultDeposit": 500, "lateFeePerDay": 50, "cancellationPolicy": "24 hours"}')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Initial Admin (Password: admin123)
INSERT INTO `SystemAdmins` (`username`, `email`, `password_hash`, `role`) 
VALUES ('admin', 'admin@carrental.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SUPER_ADMIN')
ON DUPLICATE KEY UPDATE id=id;

COMMIT;
