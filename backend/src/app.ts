import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import { securityHeaders, corsMiddleware, generalLimiter, inputSanitizer } from '@/middlewares/security.middleware';
import { errorHandler } from '@/middlewares/error.middleware';
import routes from '@/routes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '@/swagger';

const app = express();

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(inputSanitizer);

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SecureWatch API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'SecureWatch API Documentation',
}));

app.use('/api', routes);

app.use(errorHandler);

export default app;
