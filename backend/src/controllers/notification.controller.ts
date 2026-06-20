import { Response, NextFunction } from 'express';
import { notificationService } from '@/services/notification.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class NotificationController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.findAll(req.user!.userId, req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markRead(paramId(req.params.id), req.user!.userId);
      return sendSuccess(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllRead(req.user!.userId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await notificationService.getUnreadCount(req.user!.userId);
      return sendSuccess(res, { unreadCount: count });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
