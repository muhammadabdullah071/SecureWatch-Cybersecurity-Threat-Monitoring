import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { CreateAuditLogDTO } from '@/types';
import { calculatePagination } from '@/utils/helpers';

export class AuditService {
  async log(data: CreateAuditLogDTO) {
    let userEmail = data.userEmail;
    if (!userEmail) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { email: true },
      });
      userEmail = user?.email || 'unknown';
    }

    return prisma.auditLog.create({
      data: {
        userId: data.userId,
        userEmail,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId || null,
        details: data.details || null,
        ipAddress: data.ipAddress || null,
      },
    });
  }

  async findAll(query: any) {
    const { page, limit, action, entity, userId, startDate, endDate, sortBy, sortOrder } = query;

    const where: any = {};

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prisma.auditLog.count({ where });
    const pagination = calculatePagination(page || 1, limit || 50, total);

    const logs = await prisma.auditLog.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return { data: logs, pagination };
  }

  async findById(id: string) {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!log) {
      throw new ApiError(404, 'Audit log not found');
    }

    return log;
  }
}

export const auditService = new AuditService();
