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

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Successfully connected to MySQL database: ${process.env.DB_NAME || 'rsu_vpass'} at ${process.env.DB_HOST || '127.0.0.1'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.code || error.message || error);
    return false;
  }
};

export default pool;
