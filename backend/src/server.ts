import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './database/connection.js';
import { logger } from './utils/logger.js';
import http from 'http';

async function bootstrap() {
  try {
    await connectDatabase();

    const app = createApp();
    const server = http.createServer(app);

    server.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`  Coworking Modular Monolith API Server Running    `);
      logger.info(`  Environment : ${env.NODE_ENV}`);
      logger.info(`  Port        : ${env.PORT}`);
      logger.info(`  API Base    : http://localhost:${env.PORT}/api/v1`);
      logger.info(`  Health      : http://localhost:${env.PORT}/api/v1/health`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();
