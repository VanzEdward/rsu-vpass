import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rsu_vpass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // SSL only if DB_SSL === 'true' (e.g., Aiven Cloud)
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

import logger from '../utils/logger.js';

export const testConnection = async () => {
  const host = process.env.DB_HOST || '127.0.0.1';
  const port = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'rsu_vpass';

  try {
    const connection = await pool.getConnection();
    logger.db(`Connected to MySQL: database "${dbName}" on ${host}:${port}`);
        try {
      const [cols] = await connection.query('DESCRIBE applications');
      const f = cols.map(col => col.Field);
      if (!f.includes('or_url')) {
        await connection.query('ALTER TABLE applications ADD COLUMN or_url LONGTEXT NULL AFTER driver_license_url');
        logger.db('Added column or_url to applications table.');
      }
      if (!f.includes('cr_url')) {
        await connection.query('ALTER TABLE applications ADD COLUMN cr_url LONGTEXT NULL AFTER or_url');
        logger.db('Added column cr_url to applications table.');
      }
      await connection.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          school_id VARCHAR(50) NOT NULL,
          email VARCHAR(120) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          used_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_user_otp (school_id, email, otp_code)
        ) ENGINE=InnoDB
      `);
      await connection.query(`
        CREATE TABLE IF NOT EXISTS system_settings (
          setting_key VARCHAR(100) PRIMARY KEY,
          setting_value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB
      `);
      const [vpCols] = await connection.query('DESCRIBE vehicle_passes');
      const vpFields = vpCols.map(col => col.Field);
      if (!vpFields.includes('academic_year')) {
        await connection.query("ALTER TABLE vehicle_passes ADD COLUMN academic_year VARCHAR(50) DEFAULT '2026-2027' AFTER valid_until");
        logger.db('Added column academic_year to vehicle_passes table.');
      }
      if (!vpFields.includes('template_version')) {
        await connection.query("ALTER TABLE vehicle_passes ADD COLUMN template_version VARCHAR(20) DEFAULT 'V1' AFTER academic_year");
        logger.db('Added column template_version to vehicle_passes table.');
      }
      await connection.query("UPDATE vehicle_passes SET academic_year = COALESCE(NULLIF(academic_year, ''), '2026-2027'), template_version = COALESCE(NULLIF(template_version, ''), 'V1') WHERE academic_year IS NULL OR academic_year = '' OR template_version IS NULL OR template_version = ''");
    } catch (e) {
      // Ignore if table does not exist yet during initial boot
    }
    connection.release();
    return true;
  } catch (error) {
    logger.db(`Connection failed to ${host}:${port}`, error);
    return false;
  }
};

export const checkDatabaseHealth = async () => {
  const start = Date.now();
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT 1 as ping');
    const [tables] = await connection.query('SHOW TABLES');
    connection.release();
    return {
      status: 'connected',
      latencyMs: Date.now() - start,
      database: process.env.DB_NAME || 'rsu_vpass',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      tableCount: tables.length,
      ping: result[0]?.ping === 1
    };
  } catch (error) {
    return {
      status: 'disconnected',
      latencyMs: Date.now() - start,
      error: error.code || error.message,
      hint: error.code === 'ECONNREFUSED' 
        ? 'MySQL service is not running on 127.0.0.1:3306. Check XAMPP Control Panel.' 
        : error.message
    };
  }
};

export default pool;
