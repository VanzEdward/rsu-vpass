import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import pasoRoutes from './routes/pasoRoutes.js';
import passRoutes from './routes/passRoutes.js';
import guardRoutes from './routes/guardRoutes.js';
import { testConnection, checkDatabaseHealth } from './config/db.js';
import requestLogger from './middleware/requestLogger.js';
import errorHandler from './middleware/errorHandler.js';
import logger from './utils/logger.js';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request & Performance Logger
app.use(requestLogger);

// Health Check Endpoint (Includes real-time database connectivity and latency)
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'online' : 'degraded',
    service: 'RSU VPASS Backend API',
    uptime: Math.floor(process.uptime()) + 's',
    timestamp: new Date().toISOString(),
    database: dbHealth
  });
});

// Logs Endpoint: Quick inspection of the last 40 lines of error.log
app.get('/api/logs/recent', (req, res) => {
  const errorLogPath = path.join(__dirname, 'logs/error.log');
  if (!fs.existsSync(errorLogPath)) {
    return res.json({ message: 'No error log entries recorded yet.', lines: [] });
  }

  try {
    const content = fs.readFileSync(errorLogPath, 'utf8');
    const lines = content.trim().split('\n').filter(Boolean);
    const recent = lines.slice(-40);
    res.json({
      totalLines: lines.length,
      recentLines: recent
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not read error logs' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/paso', pasoRoutes);
app.use('/api/passes', passRoutes);
app.use('/api/guard', guardRoutes);

// Render Deployment helper: Serve client/dist if built
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If client is not built yet, return friendly API status
      res.status(200).send('RSU VPASS API is active. Connect with React frontend.');
    }
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚗 RSU VPASS Server running on port ${PORT}`);
  console.log(`🌐 Target: http://localhost:${PORT}`);
  console.log(`📋 Logs stored in: server/logs/`);
  console.log(`=========================================`);
  await testConnection();
});
