import express from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const stateIndex = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    service: 'insta-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: {
      status: dbState[stateIndex] || 'unknown',
      connected: stateIndex === 1,
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null
    },
    memory: {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    }
  });
});

export default router;
