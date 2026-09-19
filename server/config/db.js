import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
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
