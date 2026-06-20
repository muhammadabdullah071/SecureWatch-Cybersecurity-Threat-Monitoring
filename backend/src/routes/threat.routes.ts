import { Router } from 'express';
import { threatController } from '@/controllers/threat.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  createThreatSchema,
  updateThreatSchema,
  threatQuerySchema,
} from '@/validators/threat.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', threatController.getStats);
router.get('/', validate({ query: threatQuerySchema }), threatController.findAll);
router.get('/:id', threatController.findById);
router.post('/', authorize('ADMIN', 'ANALYST'), validate({ body: createThreatSchema }), threatController.create);
router.put('/:id', authorize('ADMIN', 'ANALYST'), validate({ body: updateThreatSchema }), threatController.update);
router.delete('/:id', authorize('ADMIN'), threatController.delete);

export default router;
