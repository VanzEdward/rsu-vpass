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
import { testConnection } from './config/db.js';

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

// Health Check Endpoint (Useful for Render.com uptime monitoring)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'RSU VPASS Backend API'
  });
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

// Start Server
app.listen(PORT, async () => {
  console.log(`=========================================`);
  console.log(`🚗 RSU VPASS Server running on port ${PORT}`);
  console.log(`🌐 Target: http://localhost:${PORT}`);
  console.log(`=========================================`);
  await testConnection();
});
