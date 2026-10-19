import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './config/socket.js';

const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocket(server);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(env.PORT, () => {
      console.log(`[Server] Insta backend listening on port ${env.PORT} in ${env.NODE_ENV} mode`);
      console.log(`[Server] Health check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (err) {
    console.error('[Server] Failed to start server:', err.message);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n[Server] Graceful shutdown initiated...');
  server.close(async () => {
    console.log('[Server] HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

startServer();

export { server };
