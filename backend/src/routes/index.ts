import { Router } from 'express';
import authRoutes from './auth.routes';
import threatRoutes from './threat.routes';
import incidentRoutes from './incident.routes';
import userRoutes from './user.routes';
import analyticsRoutes from './analytics.routes';
import notificationRoutes from './notification.routes';
import auditRoutes from './audit.routes';
import threatIntelRoutes from './threat-intel.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/threats', threatRoutes);
router.use('/incidents', incidentRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/threat-intel', threatIntelRoutes);

export default router;
