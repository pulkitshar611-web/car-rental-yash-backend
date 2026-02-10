-- ========================================
-- CAR RENTAL - Tables Only (No Drop)
-- Import this directly in phpMyAdmin
-- ========================================

USE `car`;

-- Drop tables if exist (in correct order)
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `maintenance`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `rentals`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `vehicles`;
DROP TABLE IF EXISTS `admins`;
DROP TABLE IF EXISTS `settings`;

-- ========================================
-- TABLE 1: Admins
-- ========================================
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `role` ENUM('SUPER_ADMIN', 'MANAGER', 'STAFF') DEFAULT 'STAFF',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 2: Vehicles
-- ========================================
CREATE TABLE `vehicles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `model` VARCHAR(100) NOT NULL,
  `plateNumber` VARCHAR(20) NOT NULL UNIQUE,
  `dailyPrice` DECIMAL(10, 2) NOT NULL,
  `weeklyPrice` DECIMAL(10, 2) DEFAULT NULL,
  `monthlyPrice` DECIMAL(10, 2) DEFAULT NULL,
  `deposit` DECIMAL(10, 2) DEFAULT NULL,
  `insuranceRequired` TINYINT(1) DEFAULT 0,
  `status` ENUM('available', 'rented', 'maintenance', 'outOfService') DEFAULT 'available',
  `image` VARCHAR(255) DEFAULT NULL,
  `qrCode` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 3: Customers
-- ========================================
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(100) DEFAULT NULL,
  `idNumber` VARCHAR(50) DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `insurance` TINYINT(1) DEFAULT 0,
  `depositPaid` TINYINT(1) DEFAULT 0,
  `paymentMethod` ENUM('cash', 'credit_card', 'bank_transfer') DEFAULT 'cash',
  `outstandingBalance` DECIMAL(10, 2) DEFAULT 0,
  `rentalType` ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 4: Rentals
-- ========================================
CREATE TABLE `rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `vehicleId` INT NOT NULL,
  `startDate` DATE NOT NULL,
  `endDate` DATE NOT NULL,
  `rentalType` ENUM('daily', 'weekly', 'monthly') DEFAULT 'weekly',
  `weeklyAmount` DECIMAL(10, 2) DEFAULT NULL,
  `monthlyAmount` DECIMAL(10, 2) DEFAULT NULL,
  `depositAmount` DECIMAL(10, 2) DEFAULT 0,
  `totalAmount` DECIMAL(10, 2) NOT NULL,
  `paidAmount` DECIMAL(10, 2) DEFAULT 0,
  `remainingAmount` DECIMAL(10, 2) DEFAULT 0,
  `nextPaymentDate` DATE DEFAULT NULL,
  `status` ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
  `paymentStatus` ENUM('paid', 'due', 'overdue') DEFAULT 'due',
  `agreementSigned` TINYINT(1) DEFAULT 0,
  `qrCode` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 5: Documents
-- ========================================
CREATE TABLE `documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT NOT NULL,
  `rentalId` INT DEFAULT NULL,
  `vehicleId` INT DEFAULT NULL,
  `documentType` ENUM('driver_license', 'insurance', 'other') NOT NULL,
  `status` ENUM('uploaded', 'approved', 'rejected') DEFAULT 'uploaded',
  `fileUri` VARCHAR(255) DEFAULT NULL,
  `uploadedDate` DATE DEFAULT CURRENT_DATE,
  `expiryDate` DATE DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`rentalId`) REFERENCES `rentals`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 6: Maintenance
-- ========================================
CREATE TABLE `maintenance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vehicleId` INT NOT NULL,
  `serviceDate` DATE NOT NULL,
  `reason` ENUM('repair', 'inspection', 'accident', 'other') DEFAULT 'repair',
  `description` TEXT NOT NULL,
  `expectedReturnDate` DATE DEFAULT NULL,
  `cost` DECIMAL(10, 2) DEFAULT 0,
  `status` ENUM('scheduled', 'in_progress', 'completed') DEFAULT 'scheduled',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 7: Payments
-- ========================================
CREATE TABLE `payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rentalId` INT NOT NULL,
  `customerId` INT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `date` DATE NOT NULL,
  `method` ENUM('cash', 'credit_card', 'bank_transfer') DEFAULT 'cash',
  `status` ENUM('completed', 'pending', 'failed') DEFAULT 'completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`rentalId`) REFERENCES `rentals`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`customerId`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- TABLE 8: Settings
-- ========================================
CREATE TABLE `settings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- INSERT SAMPLE DATA
-- ========================================

-- Admin User
INSERT INTO `admins` (`username`, `email`, `password_hash`, `full_name`, `role`) VALUES
('admin', 'admin@carrental.com', '$2a$10$rFZqK9qPxVYGxKxVxVxVxO7K7K7K7K7K7K7K7K7K7K7K7K7K7K7K7', 'System Administrator', 'SUPER_ADMIN');

-- Vehicles
INSERT INTO `vehicles` (`name`, `model`, `plateNumber`, `dailyPrice`, `weeklyPrice`, `monthlyPrice`, `deposit`, `insuranceRequired`, `status`) VALUES
('Toyota Corolla', '2022', 'ABC-1234', 50.00, 300.00, 1100.00, 500.00, 1, 'available'),
('Honda Civic', '2021', 'XYZ-5678', 60.00, 350.00, 1300.00, 600.00, 1, 'rented'),
('Nissan Versa', '2020', 'DEF-9012', 45.00, 280.00, 1000.00, 400.00, 0, 'maintenance'),
('Ford Focus', '2023', 'GHI-3456', 55.00, 320.00, 1200.00, 550.00, 1, 'available'),
('Chevrolet Malibu', '2022', 'JKL-7890', 70.00, 400.00, 1500.00, 700.00, 1, 'rented'),
('Hyundai Elantra', '2021', 'MNO-2345', 52.00, 310.00, 1150.00, 500.00, 1, 'available'),
('Mazda 3', '2023', 'PQR-6789', 58.00, 340.00, 1250.00, 600.00, 1, 'rented'),
('Kia Forte', '2022', 'STU-0123', 48.00, 290.00, 1050.00, 450.00, 0, 'available'),
('Subaru Impreza', '2021', 'VWX-4567', 65.00, 380.00, 1400.00, 650.00, 1, 'outOfService'),
('Volkswagen Jetta', '2023', 'YZA-8901', 62.00, 360.00, 1350.00, 600.00, 1, 'available');

-- Customers
INSERT INTO `customers` (`name`, `phone`, `email`, `idNumber`, `address`, `insurance`, `depositPaid`, `paymentMethod`, `outstandingBalance`, `rentalType`) VALUES
('John Smith', '555-0101', 'john.smith@email.com', 'ID-12345', '123 Main St, City', 1, 1, 'credit_card', 0.00, 'weekly'),
('Sarah Johnson', '555-0102', 'sarah.j@email.com', 'ID-12346', '456 Oak Ave, City', 1, 1, 'bank_transfer', 350.00, 'weekly'),
('Michael Brown', '555-0103', 'm.brown@email.com', 'ID-12347', '789 Pine Rd, City', 0, 1, 'cash', 0.00, 'monthly'),
('Emily Davis', '555-0104', 'emily.d@email.com', 'ID-12348', '321 Elm St, City', 1, 0, 'credit_card', 600.00, 'weekly'),
('David Wilson', '555-0105', 'd.wilson@email.com', 'ID-12349', '654 Maple Dr, City', 1, 1, 'bank_transfer', 0.00, 'monthly');

-- Rentals
INSERT INTO `rentals` (`customerId`, `vehicleId`, `startDate`, `endDate`, `rentalType`, `weeklyAmount`, `monthlyAmount`, `depositAmount`, `totalAmount`, `paidAmount`, `remainingAmount`, `nextPaymentDate`, `status`, `paymentStatus`, `agreementSigned`, `qrCode`) VALUES
(1, 2, '2024-02-01', '2024-02-29', 'weekly', 350.00, NULL, 600.00, 1400.00, 1050.00, 350.00, '2024-02-22', 'active', 'due', 1, 'RENTAL-001'),
(2, 5, '2024-02-05', '2024-03-05', 'weekly', 400.00, NULL, 700.00, 1600.00, 1100.00, 500.00, '2024-02-19', 'active', 'due', 1, 'RENTAL-002'),
(3, 7, '2024-01-15', '2024-02-15', 'monthly', NULL, 1250.00, 600.00, 1250.00, 1250.00, 0.00, '2024-02-15', 'active', 'paid', 1, 'RENTAL-003'),
(4, 1, '2024-02-10', '2024-03-10', 'weekly', 300.00, NULL, 500.00, 1200.00, 500.00, 700.00, '2024-02-17', 'active', 'overdue', 0, 'RENTAL-004'),
(5, 6, '2024-02-01', '2024-03-01', 'monthly', NULL, 1150.00, 500.00, 1150.00, 1150.00, 0.00, '2024-03-01', 'active', 'paid', 1, 'RENTAL-005'),
(1, 4, '2024-02-12', '2024-03-12', 'weekly', 320.00, NULL, 550.00, 1280.00, 870.00, 410.00, '2024-02-26', 'active', 'due', 1, 'RENTAL-006');

-- Documents
INSERT INTO `documents` (`customerId`, `rentalId`, `vehicleId`, `documentType`, `status`, `uploadedDate`, `expiryDate`) VALUES
(1, NULL, NULL, 'driver_license', 'approved', '2024-02-01', NULL),
(1, NULL, NULL, 'insurance', 'approved', '2024-02-01', '2025-02-01'),
(2, 2, 5, 'driver_license', 'uploaded', '2024-02-05', NULL),
(2, NULL, NULL, 'insurance', 'rejected', '2024-02-04', NULL),
(3, NULL, NULL, 'driver_license', 'uploaded', '2024-01-20', NULL);

-- Maintenance
INSERT INTO `maintenance` (`vehicleId`, `serviceDate`, `reason`, `description`, `expectedReturnDate`, `cost`, `status`) VALUES
(3, '2024-02-15', 'repair', 'Engine oil change and filter replacement', '2024-02-20', 150.00, 'in_progress'),
(9, '2024-02-10', 'accident', 'Front bumper repair after collision', '2024-02-25', 1200.00, 'in_progress'),
(2, '2024-01-20', 'inspection', 'Annual safety inspection', '2024-01-21', 50.00, 'completed');

-- Payments
INSERT INTO `payments` (`rentalId`, `customerId`, `amount`, `date`, `method`, `status`) VALUES
(1, 1, 350.00, '2024-02-01', 'credit_card', 'completed'),
(1, 1, 350.00, '2024-02-08', 'credit_card', 'completed'),
(1, 1, 350.00, '2024-02-15', 'credit_card', 'completed'),
(2, 2, 400.00, '2024-02-05', 'bank_transfer', 'completed'),
(2, 2, 400.00, '2024-02-12', 'bank_transfer', 'completed');

-- Settings
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('business_info', '{"name": "Car Rental Management", "address": "123 Business St", "phone": "555-0000", "email": "info@carrental.com"}'),
('rental_rules', '{"insuranceRequired": true, "minimumAge": 25, "maxRentalDays": 30, "depositRequired": true, "defaultDeposit": 500, "lateFeePerDay": 50}');
