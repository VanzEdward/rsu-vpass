import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('\n======================================================');
  console.log('  RSU VPASS — Cloud MySQL Database Initializer');
  console.log('======================================================');

  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rsu_vpass',
    multipleStatements: true,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  };

  console.log(`Connecting to: ${config.host}:${config.port}`);
  console.log(`Database:     ${config.database}`);
  console.log(`User:         ${config.user}`);
  console.log(`SSL Enabled:  ${process.env.DB_SSL === 'true' ? 'YES (Cloud Mode)' : 'NO (Local Mode)'}`);
  console.log('------------------------------------------------------');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log(' Connected to MySQL successfully!');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log(' Executing schema.sql to create tables and seed default accounts...');

    await connection.query(schemaSql);
    console.log(' Schema executed successfully!');

    // Verify created tables
    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map((t) => Object.values(t)[0]);
    console.log('\n Verified Tables in Database:');
    tableNames.forEach((t) => console.log(`   - ${t}`));

    console.log('\n======================================================');
    console.log(' Cloud Database is 100% Ready for RSU VPASS!');
    console.log('======================================================\n');
  } catch (error) {
    console.error('\n Database Initialization Error:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log(`\n Tip: The database "${config.database}" does not exist yet.`);
      console.log(' In Aiven console, create a database named "rsu_vpass" or set DB_NAME=defaultdb in server/.env.\n');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
