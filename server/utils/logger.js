import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

const getTimestamp = () => {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
};

const writeToFile = (filePath, content) => {
  try {
    fs.appendFileSync(filePath, content + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
};

export const logger = {
  info: (message, meta = null) => {
    const timestamp = getTimestamp();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    const line = `[${timestamp}] [INFO] ${message}${metaStr}`;
    console.log(`ℹ️  ${line}`);
    writeToFile(combinedLogPath, line);
  },

  warn: (message, meta = null) => {
    const timestamp = getTimestamp();
    const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    const line = `[${timestamp}] [WARN] ${message}${metaStr}`;
    console.warn(`⚠️  ${line}`);
    writeToFile(combinedLogPath, line);
    writeToFile(errorLogPath, line);
  },

  error: (message, error = null, meta = null) => {
    const timestamp = getTimestamp();
    let errorDetails = '';
    
    if (error) {
      if (error instanceof Error) {
        errorDetails = `\n  Error Code: ${error.code || 'N/A'}\n  Message: ${error.message}\n  Stack: ${error.stack}`;
      } else if (typeof error === 'object') {
        errorDetails = `\n  Details: ${JSON.stringify(error, null, 2)}`;
      } else {
        errorDetails = `\n  Details: ${error}`;
      }
    }

    const metaStr = meta ? `\n  Context: ${typeof meta === 'object' ? JSON.stringify(meta) : meta}` : '';
    const fileLine = `[${timestamp}] [ERROR] ${message}${errorDetails}${metaStr}\n------------------------------------------------------------`;
    
    console.error(`❌ [${timestamp}] [ERROR] ${message} ${error?.code ? `(${error.code})` : (error?.message || '')}`);
    if (error?.stack) {
      console.error(error.stack);
    }
    
    writeToFile(combinedLogPath, fileLine);
    writeToFile(errorLogPath, fileLine);
  },

  db: (message, error = null) => {
    const timestamp = getTimestamp();
    if (error) {
      let hint = '';
      if (error.code === 'ECONNREFUSED') {
        hint = ' -> [HINT]: MySQL is not running or listening on port 3306. Check XAMPP Control Panel.';
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        hint = ' -> [HINT]: MySQL credentials (user/password) in server/.env are incorrect.';
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        hint = ' -> [HINT]: Database "rsu_vpass" does not exist. Import server/database/schema.sql.';
      }

      const fileLine = `[${timestamp}] [DATABASE ERROR] ${message} | Code: ${error.code || 'UNKNOWN'} | Message: ${error.message || error}${hint}\n------------------------------------------------------------`;
      console.error(`🗄️❌ [DB ERROR] ${message}: ${error.code || error.message || error}${hint}`);
      writeToFile(combinedLogPath, fileLine);
      writeToFile(errorLogPath, fileLine);
    } else {
      const line = `[${timestamp}] [DATABASE] ${message}`;
      console.log(`🗄️  ${line}`);
      writeToFile(combinedLogPath, line);
    }
  },

  http: (req, res, responseTimeMs) => {
    const timestamp = getTimestamp();
    const status = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const line = `[${timestamp}] [HTTP] ${method} ${url} ${status} - ${responseTimeMs}ms (IP: ${ip})`;

    if (status >= 500) {
      console.error(`🔴 ${line}`);
      writeToFile(errorLogPath, line);
    } else if (status >= 400) {
      console.warn(`🟡 ${line}`);
    } else {
      console.log(`🟢 ${line}`);
    }

    writeToFile(combinedLogPath, line);
  }
};

export default logger;
