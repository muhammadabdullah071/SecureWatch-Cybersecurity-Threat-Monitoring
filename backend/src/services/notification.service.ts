import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { calculatePagination } from '@/utils/helpers';
import { getIO } from '@/websocket/socket';

export class NotificationService {
  async create(userId: string, title: string, message: string, type = 'info', link?: string) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || null,
      },
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('notification', {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          link: notification.link,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
        });
      }
    } catch {
      // Socket not initialized yet, notification is still saved
    }

    return notification;
  }

  async findAll(userId: string, query: any) {
    const { page, limit, read } = query;

    const where: any = { userId };
    if (read !== undefined) where.read = read === 'true' || read === true;

    const total = await prisma.notification.count({ where });
    const pagination = calculatePagination(page || 1, limit || 20, total);

    const notifications = await prisma.notification.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    });

    return { data: notifications, pagination };
  }

  async markRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, read: false },
    });
  }
}

export const notificationService = new NotificationService();
