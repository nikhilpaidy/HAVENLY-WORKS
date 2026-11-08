import express, { Express } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

import authRoutes from './modules/auth/auth.routes.js';
import superAdminRoutes from './modules/super-admin/super-admin.routes.js';
import organizationRoutes from './modules/organizations/organization.routes.js';
import locationRoutes from './modules/locations/location.routes.js';
import roomRoutes from './modules/rooms/room.routes.js';
import availabilityRoutes from './modules/availability/availability.routes.js';
import companyRoutes from './modules/companies/company.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';
import allowanceRoutes from './modules/allowances/allowance.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import paymentRoutes from './modules/payments/payment.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import blogRoutes from './modules/blogs/blog.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import ticketRoutes from './modules/tickets/ticket.routes.js';
import overrideRoutes from './modules/overrides/override.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import workspaceTypeRoutes from './modules/workspace-types/workspace-type.routes.js';
import legalRoutes from './modules/legal/legal.routes.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger.js';

export function createApp(): Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
        'Expires',
        'X-App-Platform',
        'X-App-Version'
      ],
      exposedHeaders: ['*'],
      maxAge: 86400
    })
  );

  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires, X-App-Platform, X-App-Version'
    );
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use('/api/', generalLimiter);

  const apiV1 = express.Router();
  apiV1.use('/health', healthRoutes);
  apiV1.use('/auth', authRoutes);
  apiV1.use('/super-admin', superAdminRoutes);
  apiV1.use('/organizations', organizationRoutes);
  apiV1.use('/locations', locationRoutes);
  apiV1.use('/rooms', roomRoutes);
  apiV1.use('/availability', availabilityRoutes);
  apiV1.use('/companies', companyRoutes);
  apiV1.use('/bookings', bookingRoutes);
  apiV1.use('/allowances', allowanceRoutes);
  apiV1.use('/billing', billingRoutes);
  apiV1.use('/payments', paymentRoutes);
  apiV1.use('/reports', reportRoutes);
  apiV1.use('/blogs', blogRoutes);
  apiV1.use('/notifications', notificationRoutes);
  apiV1.use('/tickets', ticketRoutes);
  apiV1.use('/overrides', overrideRoutes);
  apiV1.use('/staff', staffRoutes);
  apiV1.use('/workspace-types', workspaceTypeRoutes);
  apiV1.use('/legal', legalRoutes);

  app.use('/api/v1', apiV1);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/api/docs.json', (_req, res) => res.json(swaggerDocument));

  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`
    });
  });

  app.use(errorHandler);

  return app;
}
