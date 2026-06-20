import { Router } from 'express';
import { notificationController } from '@/controllers/notification.controller';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', notificationController.findAll);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markRead);
router.patch('/read-all', notificationController.markAllRead);

export default router;
