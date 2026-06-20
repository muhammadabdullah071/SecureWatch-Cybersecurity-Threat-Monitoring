import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { validate } from '@/middlewares/validate.middleware';
import { authLimiter } from '@/middlewares/security.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@/validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), authController.register);
router.post('/login', authLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), authController.resetPassword);
router.post('/change-password', authenticate, validate({ body: changePasswordSchema }), authController.changePassword);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

export default router;
