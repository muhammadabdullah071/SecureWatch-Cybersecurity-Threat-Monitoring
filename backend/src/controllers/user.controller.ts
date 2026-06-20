import { Response, NextFunction } from 'express';
import { userService } from '@/services/user.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class UserController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.findAll(req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(paramId(req.params.id));
      return sendSuccess(res, user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.create(req.body);
      return sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(paramId(req.params.id), req.body);
      return sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.delete(paramId(req.params.id));
      return sendSuccess(res, null, 'User deactivated successfully');
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
      const user = await userService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
