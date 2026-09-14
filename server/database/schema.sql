-- ==========================================================
-- RSU VPASS - Database Schema
-- Romblon State University - Physical Assets & Security Office
-- Target: Aiven Cloud MySQL
-- ==========================================================

CREATE DATABASE IF NOT EXISTS rsu_vpass CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rsu_vpass;

-- 1. Users Table (Clients, PASO Admins, Security Guards)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role ENUM('CLIENT', 'PASO_ADMIN', 'GUARD') NOT NULL DEFAULT 'CLIENT',
    contact_number VARCHAR(30) NULL,
    photo_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    plate_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_type ENUM('Motorcycle', 'Sedan', 'SUV', 'Van', 'Pickup', 'Truck', 'Other') NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    color VARCHAR(30) NOT NULL,
    year_model INT NOT NULL,
    vehicle_photo_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    driver_license_url VARCHAR(500) NOT NULL,
    or_cr_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Payment / Cashier Reference Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id INT NOT NULL UNIQUE,
    or_number VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    recorded_by INT NULL,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remarks VARCHAR(255) NULL,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Vehicle Passes Table
CREATE TABLE IF NOT EXISTS vehicle_passes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    qr_code_data VARCHAR(255) NOT NULL,
    valid_until DATE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'REVOKED') DEFAULT 'ACTIVE',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Temporary Vehicle Passes (For visitors)
CREATE TABLE IF NOT EXISTS temporary_passes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    visitor_name VARCHAR(150) NOT NULL,
    host_name VARCHAR(150) NOT NULL,
    plate_number VARCHAR(30) NOT NULL,
    vehicle_description VARCHAR(100) NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    qr_code_data VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Verification & Entry/Exit Logs Table
CREATE TABLE IF NOT EXISTS verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL,
    plate_number VARCHAR(30) NOT NULL,
    owner_name VARCHAR(150) NOT NULL,
    guard_id INT NULL,
    verification_type ENUM('ENTRY', 'EXIT', 'CHECK') NOT NULL,
    verification_method ENUM('QR_SCAN', 'MANUAL_SEARCH') NOT NULL,
    verification_status ENUM('VALID', 'INVALID', 'EXPIRED') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guard_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- Demo Seed Data (From PRD Section 7)
-- ==========================================================

-- Client Demo Account (Password: client123)
INSERT INTO users (id, school_id, email, password, full_name, role, contact_number)
VALUES (
    1,
    '2026-00001',
    'juan.delacruz@rsu.edu.ph',
    '$2a$10$X8T7rQ/qI3m06hG2zPqT/.bM1dI4qJpQf0u9x7c.8e5wY4rZ5m8Kq', -- client123
    'Juan Dela Cruz',
    'CLIENT',
    '+63 912 345 6789'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- PASO Admin Account (Password: admin123)
INSERT INTO users (id, school_id, email, password, full_name, role, contact_number)
VALUES (
    2,
    'PASO-ADMIN-01',
    'paso@rsu.edu.ph',
    '$2a$10$X8T7rQ/qI3m06hG2zPqT/.bM1dI4qJpQf0u9x7c.8e5wY4rZ5m8Kq', -- admin123
    'PASO Administrator',
    'PASO_ADMIN',
    '+63 917 111 2222'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Gate Guard Account (Password: guard123)
INSERT INTO users (id, school_id, email, password, full_name, role, contact_number)
VALUES (
    3,
    'GUARD-GATE-01',
    'guard.main@rsu.edu.ph',
    '$2a$10$X8T7rQ/qI3m06hG2zPqT/.bM1dI4qJpQf0u9x7c.8e5wY4rZ5m8Kq', -- guard123
    'Officer Santos',
    'GUARD',
    '+63 918 333 4444'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Demo Vehicle (Honda Click 125)
INSERT INTO vehicles (id, user_id, plate_number, vehicle_type, make, model, color, year_model)
VALUES (
    1,
    1,
    'XYZ 5678',
    'Motorcycle',
    'Honda',
    'Click 125',
    'Black',
    2023
) ON DUPLICATE KEY UPDATE plate_number = VALUES(plate_number);

-- Demo Vehicle Pass
INSERT INTO vehicle_passes (id, pass_number, vehicle_id, user_id, qr_code_data, valid_until, status)
VALUES (
    1,
    'VP-2026-0001',
    1,
    1,
    'RSU-VPASS:VP-2026-0001:XYZ5678:2026-00001',
    '2026-12-31',
    'ACTIVE'
) ON DUPLICATE KEY UPDATE pass_number = VALUES(pass_number);
