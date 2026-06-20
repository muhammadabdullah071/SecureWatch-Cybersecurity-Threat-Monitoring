import { Router } from 'express';
import { userController } from '@/controllers/user.controller';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  userQuerySchema,
} from '@/validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.patch('/me', validate({ body: updateUserSchema }), userController.updateProfile);

router.get('/', authorize('ADMIN'), validate({ query: userQuerySchema }), userController.findAll);
router.get('/:id', authorize('ADMIN'), userController.findById);
router.post('/', authorize('ADMIN'), validate({ body: createUserSchema }), userController.create);
router.put('/:id', authorize('ADMIN'), validate({ body: updateUserSchema }), userController.update);
router.delete('/:id', authorize('ADMIN'), userController.delete);

export default router;
