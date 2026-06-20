import http from 'http';
import app from '@/app';
import prisma from '@/utils/prisma';
import logger from '@/utils/logger';
import { initializeSocket } from '@/websocket/socket';

const PORT = parseInt(process.env.PORT || '3001', 10);

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`SecureWatch API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Docs: http://localhost:${PORT}/api/docs`);
    });

    setupGracefulShutdown(httpServer);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

function setupGracefulShutdown(httpServer: http.Server) {
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    httpServer.close(async () => {
      logger.info('HTTP server closed');
      await prisma.$disconnect();
      logger.info('Database disconnected');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection:', reason);
  });
}

startServer();
