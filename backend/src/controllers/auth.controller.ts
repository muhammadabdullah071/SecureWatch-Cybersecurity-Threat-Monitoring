import { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendError } from '@/utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(
        req.body,
        req.headers['user-agent'],
        req.ip
      );
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(
        email,
        password,
        req.headers['user-agent'],
        req.ip
      );
      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.body.refreshToken;
      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400);
      }
      await authService.logout(refreshToken);
      return sendSuccess(res, null, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400);
      }
      const tokens = await authService.refreshToken(refreshToken);
      return sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);
      const data: any = {};
      if (process.env.NODE_ENV === 'development' && resetToken) {
        data.resetToken = resetToken;
        data.resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/reset-password?token=${resetToken}`;
      }
      return sendSuccess(res, data, 'Password reset email sent');
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      return sendSuccess(res, null, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.userId, oldPassword, newPassword);
      return sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
