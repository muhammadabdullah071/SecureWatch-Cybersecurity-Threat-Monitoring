import { Prisma } from '@prisma/client';
import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { CreateThreatDTO, UpdateThreatDTO } from '@/types';
import { calculatePagination } from '@/utils/helpers';
import { notificationService } from './notification.service';
import { auditService } from './audit.service';

export class ThreatService {
  async create(data: CreateThreatDTO, userId: string) {
    const threat = await prisma.threat.create({
      data: {
        title: data.title,
        description: data.description,
        sourceIP: data.sourceIP,
        destinationIP: data.destinationIP || null,
        attackType: data.attackType,
        severity: data.severity as any || 'MEDIUM',
        status: data.status as any || 'NEW',
        assignedToId: data.assignedToId || null,
        assignedAnalyst: data.assignedAnalyst || null,
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (data.severity === 'CRITICAL') {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', isActive: true },
        select: { id: true },
      });

      for (const admin of admins) {
        await notificationService.create(
          admin.id,
          'Critical Threat Detected',
          `A critical threat "${data.title}" has been detected from IP ${data.sourceIP}`,
          'critical',
          `/threats/${threat.id}`
        );
      }
    }

    await auditService.log({
      userId,
      userEmail: '',
      action: 'CREATE',
      entity: 'Threat',
      entityId: threat.id,
      details: JSON.stringify({ title: data.title, sourceIP: data.sourceIP, attackType: data.attackType }),
    });

    return threat;
  }

  async findAll(query: any) {
    const { page, limit, severity, status, attackType, sourceIP, search, sortBy, sortOrder, startDate, endDate } = query;

    const where: Prisma.ThreatWhereInput = {};

    if (severity) where.severity = severity as any;
    if (status) where.status = status as any;
    if (attackType) where.attackType = { contains: attackType };
    if (sourceIP) where.sourceIP = { contains: sourceIP };
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sourceIP: { contains: search } },
        { attackType: { contains: search } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await prisma.threat.count({ where });

    const pagination = calculatePagination(page || 1, limit || 10, total);

    const threats = await prisma.threat.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: { select: { incidents: true } },
      },
    });

    return { data: threats, pagination };
  }

  async findById(id: string) {
    const threat = await prisma.threat.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        incidents: {
          include: {
            assignedTo: {
              select: { id: true, firstName: true, lastName: true },
            },
            createdBy: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!threat) {
      throw new ApiError(404, 'Threat not found');
    }

    return threat;
  }

  async update(id: string, data: UpdateThreatDTO, userId: string) {
    const existing = await prisma.threat.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Threat not found');
    }

    const threat = await prisma.threat.update({
      where: { id },
      data: {
        ...data,
        severity: data.severity as any,
        status: data.status as any,
      },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    await auditService.log({
      userId,
      userEmail: '',
      action: 'UPDATE',
      entity: 'Threat',
      entityId: id,
      details: JSON.stringify({ changes: data }),
    });

    return threat;
  }

  async delete(id: string, userId: string) {
    const existing = await prisma.threat.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Threat not found');
    }

    await prisma.threat.delete({ where: { id } });

    await auditService.log({
      userId,
      userEmail: '',
      action: 'DELETE',
      entity: 'Threat',
      entityId: id,
      details: JSON.stringify({ title: existing.title }),
    });
  }

  async getStats() {
    const [severityCounts, statusCounts, total] = await Promise.all([
      prisma.threat.groupBy({
        by: ['severity'],
        _count: { severity: true },
      }),
      prisma.threat.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.threat.count(),
    ]);

    return {
      total,
      bySeverity: severityCounts.reduce((acc, curr) => {
        acc[curr.severity] = curr._count.severity;
        return acc;
      }, {} as Record<string, number>),
      byStatus: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const threatService = new ThreatService();
