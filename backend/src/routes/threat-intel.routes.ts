import { Router } from 'express';
import { threatIntelController } from '@/controllers/threat-intel.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/feeds', threatIntelController.getFeeds);
router.get('/feeds/stats', threatIntelController.getStats);
router.get('/search/ip/:ip', threatIntelController.searchIp);
router.get('/search/domain/:domain', threatIntelController.searchDomain);
router.get('/search/country/:country', threatIntelController.searchCountry);
router.post('/feeds', authorize('ADMIN', 'ANALYST'), threatIntelController.createFeed);
router.delete('/feeds/:id', authorize('ADMIN'), threatIntelController.deleteFeed);

export default router;
