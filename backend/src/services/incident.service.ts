import { Prisma } from '@prisma/client';
import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { CreateIncidentDTO, UpdateIncidentDTO } from '@/types';
import { calculatePagination } from '@/utils/helpers';
import { notificationService } from './notification.service';
import { auditService } from './audit.service';

export class IncidentService {
  async create(data: CreateIncidentDTO, userId: string) {
    if (data.threatId) {
      const threat = await prisma.threat.findUnique({ where: { id: data.threatId } });
      if (!threat) {
        throw new ApiError(404, 'Referenced threat not found');
      }
    }

    if (data.assignedToId) {
      const assignedUser = await prisma.user.findUnique({ where: { id: data.assignedToId } });
      if (!assignedUser) {
        throw new ApiError(404, 'Assigned user not found');
      }
    }

    const incident = await prisma.incident.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority as any || 'MEDIUM',
        status: data.status as any || 'OPEN',
        threatId: data.threatId || null,
        assignedToId: data.assignedToId || null,
        createdById: userId,
        notes: data.notes || null,
      },
      include: {
        threat: { select: { id: true, title: true, severity: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (data.priority === 'CRITICAL' || data.priority === 'HIGH') {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await notificationService.create(
          admin.id,
          `${data.priority} Priority Incident`,
          `A ${data.priority.toLowerCase()} priority incident "${data.title}" has been created`,
          'incident',
          `/incidents/${incident.id}`
        );
      }
    }

    if (data.assignedToId) {
      await notificationService.create(
        data.assignedToId,
        'Incident Assigned',
        `You have been assigned to incident "${data.title}"`,
        'assignment',
        `/incidents/${incident.id}`
      );
    }

    await auditService.log({
      userId,
      userEmail: '',
      action: 'CREATE',
      entity: 'Incident',
      entityId: incident.id,
      details: JSON.stringify({ title: data.title, priority: data.priority }),
    });

    return incident;
  }

  async findAll(query: any) {
    const { page, limit, priority, status, search, sortBy, sortOrder, startDate, endDate } = query;

    const where: Prisma.IncidentWhereInput = {};

    if (priority) where.priority = priority as any;
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { notes: { contains: search } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prisma.incident.count({ where });

    const pagination = calculatePagination(page || 1, limit || 10, total);

    const incidents = await prisma.incident.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      include: {
        threat: { select: { id: true, title: true, severity: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    return { data: incidents, pagination };
  }

  async findById(id: string) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        threat: {
          select: { id: true, title: true, description: true, severity: true, sourceIP: true, attackType: true },
        },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!incident) {
      throw new ApiError(404, 'Incident not found');
    }

    return incident;
  }

  async update(id: string, data: UpdateIncidentDTO, userId: string) {
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Incident not found');
    }

    if (data.threatId) {
      const threat = await prisma.threat.findUnique({ where: { id: data.threatId } });
      if (!threat) {
        throw new ApiError(404, 'Referenced threat not found');
      }
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        ...data,
        priority: data.priority as any,
        status: data.status as any,
      },
      include: {
        threat: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await auditService.log({
      userId,
      userEmail: '',
      action: 'UPDATE',
      entity: 'Incident',
      entityId: id,
      details: JSON.stringify({ changes: data }),
    });

    return incident;
  }

  async close(id: string, userId: string) {
    const existing = await prisma.incident.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Incident not found');
    }

    const incident = await prisma.incident.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        threat: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    await auditService.log({
      userId,
      userEmail: '',
      action: 'CLOSE',
      entity: 'Incident',
      entityId: id,
      details: JSON.stringify({ closedAt: incident.closedAt }),
    });

    return incident;
  }

  async getStats() {
    const [priorityCounts, statusCounts, total, closed] = await Promise.all([
      prisma.incident.groupBy({
        by: ['priority'],
        _count: { priority: true },
      }),
      prisma.incident.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.incident.count(),
      prisma.incident.findMany({
        where: { closedAt: { not: null } },
        select: { createdAt: true, closedAt: true },
      }),
    ]);

    let avgResolutionTime = 0;
    if (closed.length > 0) {
      const totalTime = closed.reduce((sum, inc) => {
        if (inc.closedAt) {
          return sum + (inc.closedAt.getTime() - inc.createdAt.getTime());
        }
        return sum;
      }, 0);
      avgResolutionTime = Math.round(totalTime / closed.length / (1000 * 60 * 60));
    }

    return {
      total,
      byPriority: priorityCounts.reduce((acc, curr) => {
        acc[curr.priority] = curr._count.priority;
        return acc;
      }, {} as Record<string, number>),
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
      avgResolutionTimeHours: avgResolutionTime,
      resolvedCount: closed.length,
    };
  }
}

export const incidentService = new IncidentService();
