import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Aiven MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rsu_vpass',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aiven requires SSL/TLS encryption
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to Aiven MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export default pool;
