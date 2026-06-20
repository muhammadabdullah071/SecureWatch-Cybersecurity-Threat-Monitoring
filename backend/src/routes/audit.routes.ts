import { Router } from 'express';
import { auditController } from '@/controllers/audit.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', auditController.findAll);
router.get('/:id', auditController.findById);

export default router;
