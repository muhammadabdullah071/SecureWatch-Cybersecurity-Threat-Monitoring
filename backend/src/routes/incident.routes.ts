import { Router } from 'express';
import { incidentController } from '@/controllers/incident.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  createIncidentSchema,
  updateIncidentSchema,
  incidentQuerySchema,
} from '@/validators/incident.validator';

const router = Router();

router.use(authenticate);

router.get('/stats', incidentController.getStats);
router.get('/', validate({ query: incidentQuerySchema }), incidentController.findAll);
router.get('/:id', incidentController.findById);
router.post('/', authorize('ADMIN', 'ANALYST'), validate({ body: createIncidentSchema }), incidentController.create);
router.put('/:id', authorize('ADMIN', 'ANALYST'), validate({ body: updateIncidentSchema }), incidentController.update);
router.patch('/:id/close', authorize('ADMIN', 'ANALYST'), incidentController.close);

export default router;
