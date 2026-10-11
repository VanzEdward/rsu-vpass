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
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    middle_name VARCHAR(100) NULL,
    age INT NULL,
    current_address TEXT NULL,
    permanent_address TEXT NULL,
    drivers_license_no VARCHAR(50) NULL,
    classification ENUM('STUDENT', 'EMPLOYEE') DEFAULT 'STUDENT',
    year_course VARCHAR(150) NULL,
    department_unit VARCHAR(150) NULL,
    emergency_name VARCHAR(150) NULL,
    emergency_relation VARCHAR(100) NULL,
    emergency_phone VARCHAR(50) NULL,
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
    vehicle_photo_url LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_ref_number VARCHAR(50) NULL,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'RECEIPT_SUBMITTED', 'PASS_ISSUED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    applicant_photo LONGTEXT NULL,
    driver_license_url LONGTEXT NULL,
    or_cr_url LONGTEXT NULL,
    receipt_or_number VARCHAR(100) NULL,
    receipt_photo_url LONGTEXT NULL,
    receipt_rejection_remark TEXT NULL,
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
    qr_code_data LONGTEXT NOT NULL,
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
    destination VARCHAR(100) NULL,
    purpose VARCHAR(255) NULL,
    contact VARCHAR(50) NULL,
    id_presented VARCHAR(100) NULL,
    entry_gate VARCHAR(50) NULL,
    exit_gate VARCHAR(50) NULL,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    qr_code_data LONGTEXT NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'EXITED') DEFAULT 'ACTIVE',
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
    classification VARCHAR(50) DEFAULT 'STUDENT',
    guard_id INT NULL,
    gate_station VARCHAR(50) DEFAULT 'Gate 1',
    verification_type ENUM('ENTRY', 'EXIT', 'CHECK') NOT NULL,
    verification_method ENUM('QR_SCAN', 'MANUAL_SEARCH') NOT NULL,
    verification_status ENUM('VALID', 'INVALID', 'EXPIRED') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guard_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ==========================================================
-- System Seed Data (Essential Administrative Accounts)
-- ==========================================================

-- PASO Admin Account (Default Credentials: PASO-ADMIN-01 / admin)
INSERT INTO users (id, school_id, email, password, full_name, role, contact_number)
VALUES (
    2,
    'PASO-ADMIN-01',
    'paso@rsu.edu.ph',
    '$2b$10$f5THNbdhVPHUobjsTEtH3OtMIKeA83NqIPLvrZvXVUGv4y.HvChRW',
    'PASO Administrator',
    'PASO_ADMIN',
    '+63 917 111 2222'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password);

-- Gate Guard Account (Default Credentials: GUARD-GATE-01 / guard)
INSERT INTO users (id, school_id, email, password, full_name, role, contact_number)
VALUES (
    3,
    'GUARD-GATE-01',
    'guard.main@rsu.edu.ph',
    '$2b$10$8f4pS0teMTtLX9z7D5u.xOybkWkWoi9onTEeq.hnUUD.tRHUqP2we',
    'Officer Santos',
    'GUARD',
    '+63 918 333 4444'
) ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), password = VALUES(password);

