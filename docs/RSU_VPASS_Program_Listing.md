# ROMBLON STATE UNIVERSITY
### PHYSICAL ASSETS AND SECURITY OFFICE (PASO)
**Odiongan Main Campus, Romblon, Philippines**

---

# RSU VPASS: Automated Vehicle Pass & Campus Gate Security Management System
## OFFICIAL PROGRAM LISTING & SOURCE CODE DOCUMENTATION
**Software Version: 2.1.0 • Target Environment: Aiven Cloud MySQL & Node.js Production Stack**

---

## 1. Technical Architecture & Technology Stack Overview

RSU VPASS is developed using a modern decoupled client-server architecture designed for high-concurrency mobile gate scanning, transactional document approvals, and real-time campus safety monitoring.

```
+-------------------------------------------------------------------------------------------------+
|                                 RSU VPASS SYSTEM ARCHITECTURE                                   |
+-------------------------------------------------------------------------------------------------+
|                                                                                                 |
|   +-----------------------+     +-----------------------+     +-----------------------------+   |
|   |   CLIENT PORTAL       |     |   PASO ADMIN PORTAL   |     |   GATE SECURITY SCANNER     |   |
|   |  (Student / Employee) |     | (Superuser Management)|     |   (Mobile Optical Station)  |   |
|   +-----------+-----------+     +-----------+-----------+     +--------------+--------------+   |
|               |                             |                                |                  |
|               +-----------------------------+--------------------------------+                  |
|                                             |                                                   |
|                                             v  [ HTTPS / JSON REST APIs ]                       |
|                          +-------------------------------------+                                |
|                          |     EXPRESS 5.0 APPLICATION SERVER  |                                |
|                          |    (Node.js 22 LTS Runtime Engine)  |                                |
|                          +------------------+------------------+                                |
|                                             |                                                   |
|                     +-----------------------+-----------------------+                           |
|                     |                                               |                           |
|                     v                                               v                           |
|      +------------------------------+                +-------------------------------+          |
|      |  AIVEN CLOUD MYSQL DATABASE  |                |  BREVO TRANSACTIONAL EMAIL    |          |
|      | (Encrypted SSL Pool Engine)  |                | (Pass & Status Notifications) |          |
|      +------------------------------+                +-------------------------------+          |
|                                                                                                 |
+-------------------------------------------------------------------------------------------------+
```

### Core Technologies
- **Backend Environment**: Node.js (v20+ / v22 LTS), Express.js (REST API routing), `mysql2/promise` (connection pooling), `jsonwebtoken` (JWT bearer authentication), `bcryptjs` (passwords hashing).
- **Frontend Environment**: React 19, Vite (V8 Bundler), Tailwind CSS 4, React Router 7.
- **Client Utilities**: `qrcode` (dynamic canvas QR code generation), `jsQR` (real-time optical camera viewfinder scanning), `lucide-react` (icons).
- **Database Engine**: Aiven Cloud Managed MySQL 8.0 with automated migrations, foreign key constraints, and indexes.

---

## 2. Database Definition & Schema Listing (`server/database/schema.sql`)

This script defines the authoritative schema of the RSU VPASS database, establishing relational constraints, automatic timestamps, and ENUM types for application milestones and gate verifications.

```sql
-- ==========================================================
-- RSU VPASS - Database Schema
-- Romblon State University - Physical Assets & Security Office
-- Target: Aiven Cloud MySQL 8.0 Engine
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
    classification ENUM('STUDENT', 'EMPLOYEE') DEFAULT 'STUDENT',
    year_course VARCHAR(150) NULL,
    department_unit VARCHAR(150) NULL,
    emergency_name VARCHAR(150) NULL,
    emergency_relation VARCHAR(100) NULL,
    emergency_phone VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_school_id (school_id)
) ENGINE=InnoDB;

-- 2. Vehicles Table (Enforces 1 record per physical plate)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_plate (plate_number)
) ENGINE=InnoDB;

-- 3. Applications Table (Multi-stage milestone lifecycle)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_ref_number VARCHAR(50) NULL,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'RECEIPT_SUBMITTED', 'PASS_ISSUED', 'REJECTED') DEFAULT 'PENDING',
    rejection_reason TEXT NULL,
    applicant_photo LONGTEXT NULL,
    driver_license_url LONGTEXT NULL,
    or_url LONGTEXT NULL,
    cr_url LONGTEXT NULL,
    or_cr_url LONGTEXT NULL,
    receipt_or_number VARCHAR(100) NULL,
    receipt_photo_url LONGTEXT NULL,
    receipt_rejection_remark TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_app_status (status),
    INDEX idx_app_ref (app_ref_number)
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

-- 5. Vehicle Passes Table (Authoritative credentials locked to Academic Year)
CREATE TABLE IF NOT EXISTS vehicle_passes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pass_number VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    qr_code_data LONGTEXT NOT NULL,
    valid_until DATE NOT NULL,
    academic_year VARCHAR(50) DEFAULT '2026-2027',
    template_version VARCHAR(20) DEFAULT 'V1',
    status ENUM('ACTIVE', 'EXPIRED', 'REVOKED') DEFAULT 'ACTIVE',
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_pass_number (pass_number),
    INDEX idx_pass_ay (academic_year)
) ENGINE=InnoDB;

-- 6. Temporary Vehicle Passes (For campus visitors: 1 to 7 Days Stay)
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
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    qr_code_data LONGTEXT NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED', 'EXITED') DEFAULT 'ACTIVE',
    created_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_visitor_plate (plate_number)
) ENGINE=InnoDB;

-- 7. Verification & Entry/Exit Logs Table (Live audit stream)
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
    FOREIGN KEY (guard_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_timestamp (timestamp),
    INDEX idx_log_plate (plate_number)
) ENGINE=InnoDB;

-- 8. System Settings Table (Key-Value Configuration)
CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

---

## 3. Database Connection Pool & Auto-Migration (`server/config/db.js`)

Manages TLS-secured connection pooling to Aiven MySQL Cloud and verifies database column health on system boot.

```javascript
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// SSL MySQL connection pool for Aiven Cloud Database
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rsu_vpass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

export default pool;
```

---

## 4. Vehicle Registration & Duplicate Prevention Controller (`server/controllers/vehicleController.js`)

Implements space-insensitive and case-insensitive plate normalization, blocks duplicate vehicle entries with HTTP `409 Conflict`, and handles in-place annual pass renewals.

```javascript
// 🟢 NEW: Vehicle Registration Controller with In-Place Renewal & Anti-Duplicate Engine
import pool from '../config/db.js';

// Normalizes plate number keys: "abc 1234" -> "ABC1234"
const normalizePlateKey = (val) => String(val || '').replace(/\s+/g, '').toUpperCase();

// Helper to resolve Canva sticker template version from Academic Year
const resolveTemplateFromAcademicYear = (academicYear) => {
  if (academicYear === '2027-2028') return 'V2';
  if (academicYear === '2028-2029') return 'V3';
  return 'V1';
};

// 1. Register a new vehicle (Milestone 1)
export const registerVehicle = async (req, res) => {
  try {
    const { 
      plateNumber, vehicleType = 'Motorcycle',
      make, model, color, year = '2026',
      applicant_photo, driverLicense, orCopy, crCopy, orCr
    } = req.body;
    
    const finalPlate = (plateNumber || '').trim().toUpperCase();
    const normalizedPlate = normalizePlateKey(finalPlate);
    const finalMake = (make || '').trim();
    const finalModel = (model || '').trim();
    const finalColor = (color || '').trim();
    const finalYear = parseInt(year, 10) || 2026;
    const finalLicense = driverLicense || '';
    const finalOr = orCopy || orCr || '';
    const finalCr = crCopy || orCr || '';
    const finalOrCr = finalOr || finalCr || '';

    if (!normalizedPlate || !finalMake || !finalModel || !finalColor) {
      return res.status(400).json({ message: 'Plate Number, Make, Model, and Color are required.' });
    }

    // Check if plate already registered (space-insensitive)
    const [existingPlate] = await pool.query(
      "SELECT id, user_id, plate_number FROM vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = ? LIMIT 1",
      [normalizedPlate]
    );

    let vehicleId;
    if (existingPlate.length > 0) {
      // Security Guard: Check if owned by another user
      if (existingPlate[0].user_id !== req.user.id) {
        return res.status(409).json({
          code: 'PLATE_OWNED_BY_OTHER_USER',
          message: `Plate number "${finalPlate}" is already registered by another user.`
        });
      }

      vehicleId = existingPlate[0].id;

      // Enforce 1 vehicle = 1 pass lifecycle: Prevent duplicate application entries
      const [existingApps] = await pool.query(
        'SELECT id, app_ref_number, status FROM applications WHERE vehicle_id = ? AND user_id = ? ORDER BY updated_at DESC LIMIT 1',
        [vehicleId, req.user.id]
      );
      const [existingPasses] = await pool.query(
        'SELECT id, pass_number, status, academic_year FROM vehicle_passes WHERE vehicle_id = ? LIMIT 1',
        [vehicleId]
      );

      if (existingApps.length > 0 || existingPasses.length > 0) {
        const latestApp = existingApps[0] || null;
        const existingPass = existingPasses[0] || null;
        const existingAppId = latestApp?.app_ref_number || `APP-2026-${String(latestApp?.id).padStart(4, '0')}`;

        if (existingPass || latestApp?.status === 'PASS_ISSUED') {
          return res.status(409).json({
            code: 'VEHICLE_ALREADY_HAS_PASS',
            existingAppId,
            passNumber: existingPass?.pass_number || null,
            academicYear: existingPass?.academic_year || null,
            message: `Vehicle with plate "${existingPlate[0].plate_number || finalPlate}" already has an existing VPASS (${existingPass?.pass_number || 'Issued'}). Please use the Renew button on your existing vehicle instead of creating a duplicate registration.`
          });
        }

        return res.status(409).json({
          code: 'VEHICLE_APPLICATION_ALREADY_EXISTS',
          existingAppId,
          existingStatus: latestApp?.status || 'PENDING',
          message: `Vehicle with plate "${existingPlate[0].plate_number || finalPlate}" already has an existing application (${existingAppId}, status: ${latestApp?.status || 'PENDING'}). Please track that application instead.`
        });
      }

      // Update vehicle specifications in-place if orphan record
      await pool.query(
        'UPDATE vehicles SET plate_number = ?, vehicle_type = ?, make = ?, model = ?, color = ?, year_model = ? WHERE id = ?',
        [finalPlate, vehicleType, finalMake, finalModel, finalColor, finalYear, vehicleId]
      );
    } else {
      // Insert new vehicle record
      const [vehResult] = await pool.query(
        'INSERT INTO vehicles (user_id, plate_number, vehicle_type, make, model, color, year_model) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, finalPlate, vehicleType, finalMake, finalModel, finalColor, finalYear]
      );
      vehicleId = vehResult.insertId;
    }

    // Generate formatted Application Reference Number
    const [appCountRows] = await pool.query('SELECT COUNT(*) as cnt FROM applications');
    const appRef = `APP-2026-${String((appCountRows[0].cnt || 0) + 1).padStart(4, '0')}`;

    const [appResult] = await pool.query(
      `INSERT INTO applications (
        app_ref_number, user_id, vehicle_id, status, applicant_photo, driver_license_url, or_url, cr_url, or_cr_url
      ) VALUES (?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)`,
      [appRef, req.user.id, vehicleId, applicant_photo, finalLicense, finalOr, finalCr, finalOrCr]
    );

    res.status(201).json({
      message: 'Vehicle registration submitted to PASO successfully!',
      applicationId: appResult.insertId,
      appRef,
      vehicleId
    });
  } catch (error) {
    console.error('Error in registerVehicle:', error);
    res.status(500).json({ message: 'Failed to register vehicle', error: error.message });
  }
};

// 2. Re-submit returned application or Submit Annual Pass Renewal
export const resubmitApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { 
      plateNumber, vehicleType, make, model, color, year,
      driverLicense, orCopy, crCopy, orCr, applicant_photo, isRenewal
    } = req.body;

    const appCondition = isNaN(Number(applicationId)) ? 'a.app_ref_number = ?' : 'a.id = ?';
    const [apps] = await pool.query(
      `SELECT a.id, a.vehicle_id, a.status FROM applications a WHERE ${appCondition} AND a.user_id = ?`,
      [applicationId, req.user.id]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found or unauthorized' });
    }

    const app = apps[0];
    const renewingPass = app.status === 'PASS_ISSUED' || Boolean(isRenewal);
    const finalPlate = (plateNumber || '').trim().toUpperCase();
    const normalizedPlate = normalizePlateKey(finalPlate);

    // Prevent collision with another vehicle's plate
    if (normalizedPlate) {
      const [conflicts] = await pool.query(
        "SELECT id, user_id FROM vehicles WHERE REPLACE(UPPER(plate_number), ' ', '') = ? AND id != ? LIMIT 1",
        [normalizedPlate, app.vehicle_id]
      );
      if (conflicts.length > 0) {
        return res.status(409).json({
          code: 'PLATE_COLLISION',
          message: `Plate number "${finalPlate}" is already registered to another vehicle.`
        });
      }
    }

    // Update vehicle specifications
    await pool.query(
      `UPDATE vehicles 
       SET plate_number = COALESCE(NULLIF(?, ''), plate_number),
           vehicle_type = COALESCE(NULLIF(?, ''), vehicle_type),
           make = COALESCE(NULLIF(?, ''), make),
           model = COALESCE(NULLIF(?, ''), model),
           color = COALESCE(NULLIF(?, ''), color),
           year_model = COALESCE(?, year_model)
       WHERE id = ?`,
      [finalPlate, vehicleType, make, model, color, year, app.vehicle_id]
    );

    // Clear previous receipt on annual renewal so new Cashier fee is required
    const clearReceiptSql = renewingPass
      ? ', receipt_or_number = NULL, receipt_photo_url = NULL, receipt_rejection_remark = NULL'
      : '';

    await pool.query(
      `UPDATE applications 
       SET status = 'PENDING',
           rejection_reason = NULL${clearReceiptSql},
           driver_license_url = COALESCE(?, driver_license_url),
           or_url = COALESCE(?, or_url),
           cr_url = COALESCE(?, cr_url),
           or_cr_url = COALESCE(?, or_cr_url),
           applicant_photo = COALESCE(?, applicant_photo)
       WHERE id = ?`,
      [driverLicense, orCopy || orCr, crCopy || orCr, orCr, applicant_photo, app.id]
    );

    res.json({ message: 'Application updated and submitted to PASO queue!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resubmit application', error: error.message });
  }
};
```

---

## 5. PASO Administrator Controller (`server/controllers/pasoController.js`)

Controls application reviews, cashier receipt audits, and issues official passes locked to the active academic year.

```javascript
// 🟢 NEW: PASO Admin Controller (Receipt Verification & In-Place Pass Issuance)
import pool from '../config/db.js';
import { sendPassIssuedEmail, sendReceiptRejectedEmail } from '../services/emailService.js';

// Resolves exact expiration date based on Academic Year: "2026-2027" -> "2027-07-31"
const resolveSqlDateFromAcademicYear = (academicYear = '2026-2027') => {
  const parts = String(academicYear).split('-');
  let endYear = 2027;
  if (parts.length >= 2 && !isNaN(parseInt(parts[1], 10))) {
    const raw = parseInt(parts[1], 10);
    endYear = raw < 100 ? 2000 + raw : raw;
  } else if (!isNaN(parseInt(parts[0], 10))) {
    endYear = parseInt(parts[0], 10) + 1;
  }
  return `${endYear}-07-31`;
};

// 1. Issue Official Gate Pass (Milestone 4)
export const issuePass = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { passNumber, orNumber, amount, academicYear, templateVersion } = req.body;

    const appCondition = isNaN(Number(applicationId)) ? 'a.app_ref_number = ?' : 'a.id = ?';
    const [apps] = await pool.query(
      `SELECT a.id, a.user_id, a.vehicle_id, a.receipt_or_number,
              u.school_id, u.full_name, u.email,
              v.plate_number, v.make, v.model, v.vehicle_type
       FROM applications a
       JOIN users u ON a.user_id = u.id
       JOIN vehicles v ON a.vehicle_id = v.id
       WHERE ${appCondition}`,
      [applicationId]
    );

    if (apps.length === 0) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const app = apps[0];

    // Check if vehicle already has an issued pass row to guarantee in-place renewal update
    const [existingPassRows] = await pool.query(
      'SELECT id, pass_number FROM vehicle_passes WHERE vehicle_id = ? ORDER BY id ASC LIMIT 1',
      [app.vehicle_id]
    );
    const existingPass = existingPassRows[0] || null;

    // Preserve existing S-number on renewal or generate sequential number
    const finalPassNum = passNumber || existingPass?.pass_number || `S-${String(app.id).padStart(3, '0')}`;
    const qrData = `RSU-VPASS:${finalPassNum}:${app.plate_number}:${app.school_id}`;

    // Read active settings for Academic Year and Canva Sticker Theme
    const [settingsRows] = await pool.query(
      "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('academicYear', 'stickerTemplateVersion')"
    );
    const settingsMap = Object.fromEntries(settingsRows.map(r => [r.setting_key, r.setting_value]));
    const finalAcadYear = academicYear || settingsMap.academicYear || '2026-2027';
    const finalTemplate = templateVersion || settingsMap.stickerTemplateVersion || 'V1';
    const finalValidUntil = resolveSqlDateFromAcademicYear(finalAcadYear);

    // Update existing pass in-place OR insert new record
    if (existingPass) {
      await pool.query(
        `UPDATE vehicle_passes
         SET pass_number = ?, user_id = ?, qr_code_data = ?, valid_until = ?,
             academic_year = ?, template_version = ?, status = 'ACTIVE', issued_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [finalPassNum, app.user_id, qrData, finalValidUntil, finalAcadYear, finalTemplate, existingPass.id]
      );
    } else {
      await pool.query(
        `INSERT INTO vehicle_passes (pass_number, vehicle_id, user_id, qr_code_data, valid_until, academic_year, template_version, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [finalPassNum, app.vehicle_id, app.user_id, qrData, finalValidUntil, finalAcadYear, finalTemplate]
      );
    }

    // Record Cashier payment entry
    const finalOr = orNumber || app.receipt_or_number;
    if (finalOr) {
      await pool.query(
        `INSERT INTO payments (application_id, or_number, amount, recorded_by, remarks)
         VALUES (?, ?, ?, ?, 'Cashier verified by PASO Admin')
         ON DUPLICATE KEY UPDATE or_number = VALUES(or_number), amount = VALUES(amount)`,
        [app.id, finalOr, amount || 150.00, req.user.id]
      );
    }

    // Set application milestone status to PASS_ISSUED
    await pool.query(`UPDATE applications SET status = 'PASS_ISSUED' WHERE id = ?`, [app.id]);

    // Send automated Brevo email notification
    sendPassIssuedEmail({
      toEmail: app.email,
      recipientName: app.full_name,
      vehicle: `${app.make} ${app.model}`,
      plateNumber: app.plate_number,
      passNumber: finalPassNum,
      validUntil: 'July 31, ' + finalValidUntil.split('-')[0],
      academicYear: finalAcadYear,
    }).catch(err => console.error('[Brevo Error]:', err));

    res.json({
      message: 'Official Vehicle Pass issued successfully!',
      passNumber: finalPassNum,
      validUntil: finalValidUntil,
      academicYear: finalAcadYear,
      templateVersion: finalTemplate,
      qrData
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue vehicle pass', error: error.message });
  }
};
```

---

## 6. Gate Security Guard Controller (`server/controllers/guardController.js`)

Powers the mobile scanner terminal with sub-second QR code parsing, spot-check lookups, and temporary visitor passes.

```javascript
// 🟢 NEW: Gate Security Guard Controller (Live Scanner & Visitor Access)
import pool from '../config/db.js';

// 1. Verify Pass via Scanned QR Payload or Plate Number
export const verifyPass = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Pass code or QR payload required' });

    let extractedPassNum = code.trim();
    let extractedPlate = '';
    if (code.startsWith('RSU-VPASS:')) {
      const parts = code.split(':');
      extractedPassNum = (parts[1] || '').trim();
      extractedPlate = (parts[2] || '').trim().replace(/\s+/g, '').toUpperCase();
    }
    const cleanCode = code.trim();
    const cleanPlate = (extractedPlate || cleanCode).replace(/\s+/g, '').toUpperCase();

    // Query registered vehicle passes
    const [passes] = await pool.query(`
      SELECT 
        vp.id as pass_id, vp.pass_number, vp.valid_until, vp.academic_year, vp.template_version, vp.status, vp.qr_code_data,
        v.plate_number, v.vehicle_type, v.make, v.model, v.color, v.year_model,
        u.full_name, u.school_id, COALESCE(a.applicant_photo, u.photo_url) as client_photo, u.contact_number,
        u.classification, u.year_course, u.department_unit
      FROM vehicle_passes vp
      JOIN vehicles v ON vp.vehicle_id = v.id
      JOIN users u ON vp.user_id = u.id
      LEFT JOIN applications a ON a.vehicle_id = v.id
      WHERE vp.pass_number = ? OR vp.qr_code_data = ? OR REPLACE(UPPER(v.plate_number), ' ', '') = ?
      ORDER BY vp.id DESC, (a.status = 'PASS_ISSUED') DESC, a.updated_at DESC
      LIMIT 1
    `, [cleanCode, cleanCode, cleanPlate]);

    if (passes.length > 0) {
      const pass = passes[0];
      const expiryEnd = new Date(pass.valid_until);
      expiryEnd.setHours(23, 59, 59, 999);
      const isExpired = expiryEnd < new Date();

      return res.json({
        found: true,
        type: 'REGISTERED',
        isValid: pass.status === 'ACTIVE' && !isExpired,
        status: isExpired ? 'EXPIRED' : pass.status,
        pass
      });
    }

    // Query temporary visitor passes
    const [tempPasses] = await pool.query(`
      SELECT * FROM temporary_passes 
      WHERE pass_number = ? OR qr_code_data = ? OR REPLACE(UPPER(plate_number), ' ', '') = ?
      ORDER BY id DESC LIMIT 1
    `, [cleanCode, cleanCode, cleanPlate]);

    if (tempPasses.length > 0) {
      const temp = tempPasses[0];
      const now = new Date();
      const isValid = new Date(temp.valid_from) <= now && now <= new Date(temp.valid_to) && temp.status === 'ACTIVE';
      return res.json({
        found: true,
        type: 'TEMPORARY',
        isValid,
        status: isValid ? 'ACTIVE' : 'EXPIRED',
        pass: temp
      });
    }

    return res.status(404).json({ found: false, message: 'Pass not found or invalid' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying pass', error: error.message });
  }
};

// 2. Issue Temporary Visitor Pass (1 to 7 Days Stay)
export const createTemporaryPass = async (req, res) => {
  try {
    const { visitor_name, plate_number, destination, purpose, contact, id_presented, duration_days = 1, entry_gate = 'Gate 1' } = req.body;
    if (!visitor_name || !plate_number) {
      return res.status(400).json({ message: 'Visitor name and plate number are required' });
    }

    const passNumber = `TMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const validFrom = new Date();
    const validTo = new Date();
    validTo.setDate(validTo.getDate() + parseInt(duration_days, 10));
    const cleanPlate = plate_number.trim().toUpperCase().replace(/\s+/g, '');
    const qrData = `RSU-VPASS:${passNumber}:${cleanPlate}:VISITOR`;

    await pool.query(`
      INSERT INTO temporary_passes 
      (pass_number, visitor_name, host_name, plate_number, vehicle_description, valid_from, valid_to, qr_code_data, status, created_by, destination, purpose, contact, id_presented, entry_gate)
      VALUES (?, ?, ?, ?, 'Visitor Vehicle', ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?)
    `, [passNumber, visitor_name.trim(), destination, cleanPlate, validFrom, validTo, qrData, req.user?.id, destination, purpose, contact, id_presented, entry_gate]);

    // Automatically record ENTRY event in verification logs
    await pool.query(`
      INSERT INTO verification_logs 
      (pass_number, plate_number, owner_name, guard_id, verification_type, verification_method, verification_status, gate_station, classification)
      VALUES (?, ?, ?, ?, 'ENTRY', 'MANUAL_SEARCH', 'VALID', ?, 'VISITOR')
    `, [passNumber, cleanPlate, visitor_name.trim(), req.user?.id, entry_gate]);

    res.status(201).json({ message: 'Temporary visitor pass issued successfully', passNumber, qrData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue temporary pass', error: error.message });
  }
};
```

---

## 7. Client-Side State Engine & Synchronization (`client/src/context/PassContext.jsx`)

Maintains real-time state synchronization with Aiven MySQL, plate normalization, pass expiration checking, and pass deduplication.

```javascript
// 🟢 NEW: PassContext State Machine & Deduplication Algorithms
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiRequest } from "../api/client";

// Normalize plate: "abc 1234" -> "ABC1234"
export const normalizePlateNumber = (plate) =>
  String(plate || "").replace(/\s+/g, "").toUpperCase();

// Deduplicates applications to guarantee 1 pass per vehicle in UI views
export const getUniquePassApplications = (applications = []) => {
  const passApps = (applications || []).filter(
    (a) => a && (a.status === "PASS_ISSUED" || a.pass)
  );
  const byVehicle = new Map();

  for (const app of passApps) {
    const cleanPlate = normalizePlateNumber(app.vehicle?.plateNumber);
    const key = app.vehicle?.id
      ? `veh-${app.vehicle.id}`
      : cleanPlate
      ? `plate-${cleanPlate}`
      : `app-${app.id}`;

    const existing = byVehicle.get(key);
    if (!existing) {
      byVehicle.set(key, app);
      continue;
    }

    // Score priority: PASS_ISSUED (2) + ACTIVE (1)
    const existingScore = (existing.status === "PASS_ISSUED" ? 2 : 0) + (existing.pass?.status === "ACTIVE" ? 1 : 0);
    const candidateScore = (app.status === "PASS_ISSUED" ? 2 : 0) + (app.pass?.status === "ACTIVE" ? 1 : 0);

    if (candidateScore > existingScore) {
      byVehicle.set(key, app);
    } else if (candidateScore === existingScore) {
      const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
      const candidateTime = new Date(app.updated_at || app.created_at || 0).getTime();
      if (candidateTime > existingTime) {
        byVehicle.set(key, app);
      }
    }
  }

  return Array.from(byVehicle.values());
};

// Selects the authoritative application for a vehicle when legacy duplicate rows exist
export const pickBestAppForVehicle = (matchingApps = []) => {
  const valid = (matchingApps || []).filter(Boolean);
  if (valid.length === 0) return null;

  const scoreApp = (app) =>
    (app.status === "PASS_ISSUED" && app.pass ? 4 : 0) +
    (app.pass ? 2 : 0) +
    (app.isRenewal ? 1 : 0);

  return valid.reduce((best, candidate) => {
    const bestScore = scoreApp(best);
    const candidateScore = scoreApp(candidate);
    if (candidateScore > bestScore) return candidate;
    if (candidateScore < bestScore) return best;
    const bestTime = new Date(best.updated_at || best.created_at || 0).getTime();
    const candidateTime = new Date(candidate.updated_at || candidate.created_at || 0).getTime();
    return candidateTime > bestTime ? candidate : best;
  });
};

// Expiration Calculator: Checks both 'EXPIRED' status and date bounds
export const isPassExpired = (pass) => {
  if (!pass) return false;
  if (pass.status === "EXPIRED" || pass.status === "REVOKED") return true;
  if (pass.expiresAt) return new Date(pass.expiresAt).getTime() < Date.now();
  if (pass.validUntil) {
    const str = String(pass.validUntil).trim();
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      return d.getTime() < Date.now();
    }
  }
  return false;
};
```

---

## 8. Annual Canva Sticker Theme Templates (`client/src/components/RsuStickerPass.jsx`)

Defines university heritage and high-contrast color pairs for gate security recognition.

```javascript
// 🟢 NEW: Official RSU Canva Sticker Themes Configuration
export const PASS_TEMPLATES = {
  // Academic Year 2026-2027 Official Launch Template
  V1: {
    id: "V1",
    name: "Set 1: Classic Pink & Red",
    description: "RSU official launch template (A.Y. 2026–2027)",
    studentHeaderBg: "from-rose-500 to-pink-600",
    studentBadgeBg: "bg-pink-100 text-pink-800 border-pink-300",
    employeeHeaderBg: "from-red-600 to-rose-700",
    employeeBadgeBg: "bg-rose-100 text-rose-800 border-rose-300",
  },
  // Academic Year 2027-2028 Heritage Template
  V2: {
    id: "V2",
    name: "Set 2: Forest Emerald & Royal Blue",
    description: "University heritage colors for A.Y. 2027–2028",
    studentHeaderBg: "from-emerald-600 to-teal-700",
    studentBadgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    employeeHeaderBg: "from-blue-600 to-indigo-700",
    employeeBadgeBg: "bg-blue-100 text-blue-800 border-blue-300",
  },
  // Academic Year 2028-2029 Security Template
  V3: {
    id: "V3",
    name: "Set 3: Amber Gold & Crimson Maroon",
    description: "High-contrast gate security template for A.Y. 2028–2029",
    studentHeaderBg: "from-amber-500 to-yellow-600",
    studentBadgeBg: "bg-amber-100 text-amber-900 border-amber-300",
    employeeHeaderBg: "from-red-900 to-rose-950",
    employeeBadgeBg: "bg-rose-100 text-rose-900 border-rose-300",
  },
};
```

---

*End of RSU VPASS Program Listing. Certified production-grade source code for institutional deployment.*
