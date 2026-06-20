import { Router } from 'express';
import { analyticsController } from '@/controllers/analytics.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/threats-by-month', analyticsController.getThreatsByMonth);
router.get('/severity-distribution', analyticsController.getSeverityDistribution);
router.get('/attack-types', analyticsController.getAttackTypes);
router.get('/top-threat-sources', analyticsController.getTopThreatSources);
router.get('/resolution-time', analyticsController.getResolutionTime);
router.get('/threat-trends', analyticsController.getThreatTrends);

export default router;
