// nexus/backend/src/index.ts
import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocket } from './services/socket';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Initialize Socket.io for real-time updates
initSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 NEXUS API running on http://localhost:${PORT}`);
  logger.info(`📡 WebSocket server ready`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received — shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
