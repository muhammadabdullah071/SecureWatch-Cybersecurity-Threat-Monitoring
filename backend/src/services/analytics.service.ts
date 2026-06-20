import prisma from '@/utils/prisma';

export class AnalyticsService {
  async getThreatsByMonth() {
    const threats = await prisma.threat.findMany({
      select: { createdAt: true },
    });

    const grouped: Record<string, number> = {};
    threats.forEach((t) => {
      const key = t.createdAt.toISOString().substring(0, 7);
      grouped[key] = (grouped[key] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getSeverityDistribution() {
    const result = await prisma.threat.groupBy({
      by: ['severity'],
      _count: { severity: true },
    });

    return result.map((r) => ({
      name: r.severity,
      count: r._count.severity,
    }));
  }

  async getAttackTypes() {
    const result = await prisma.threat.groupBy({
      by: ['attackType'],
      _count: { attackType: true },
      orderBy: { _count: { attackType: 'desc' } },
    });

    return result.map((r) => ({
      type: r.attackType,
      count: r._count.attackType,
    }));
  }

  async getIncidentResolutionTime() {
    const closed = await prisma.incident.findMany({
      where: { closedAt: { not: null } },
      select: { createdAt: true, closedAt: true },
    });

    if (closed.length === 0) {
      return { averageHours: 0, totalResolved: 0, maxHours: 0, minHours: 0 };
    }

    const times = closed.map((inc) => {
      return (inc.closedAt!.getTime() - inc.createdAt.getTime()) / (1000 * 60 * 60);
    });

    return {
      averageHours: Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100,
      totalResolved: closed.length,
      maxHours: Math.round(Math.max(...times) * 100) / 100,
      minHours: Math.round(Math.min(...times) * 100) / 100,
    };
  }

  async getTopThreatSources(limit = 10) {
    const result = await prisma.threat.groupBy({
      by: ['sourceIP'],
      _count: { sourceIP: true },
      orderBy: { _count: { sourceIP: 'desc' } },
      take: limit,
    });

    return result.map((r) => ({
      ip: r.sourceIP,
      count: r._count.sourceIP,
    }));
  }

  async getThreatTrends(days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const threats = await prisma.threat.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().substring(0, 10);
      grouped[key] = 0;
    }

    threats.forEach((t) => {
      const key = t.createdAt.toISOString().substring(0, 10);
      if (grouped[key] !== undefined) {
        grouped[key] += 1;
      }
    });

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  async getRecentEvents(limit = 10) {
    const threats = await prisma.threat.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        severity: true,
        attackType: true,
        createdAt: true,
        status: true,
      },
    });

    return threats.map((t) => ({
      id: t.id,
      title: t.title,
      type: t.attackType,
      severity: t.severity,
      status: t.status,
      timestamp: t.createdAt,
    }));
  }

  async getDashboardStats() {
    const [
      totalThreats,
      totalIncidents,
      resolvedThreats,
      criticalThreats,
      openIncidents,
      severityDist,
      attackTypes,
      threatsByMonth,
      topSources,
      threatTrend,
      recentEvents,
      totalUsers,
      activeUsers,
    ] = await Promise.all([
      prisma.threat.count(),
      prisma.incident.count(),
      prisma.threat.count({ where: { status: 'RESOLVED' } }),
      prisma.threat.count({ where: { severity: 'CRITICAL' } }),
      prisma.incident.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      this.getSeverityDistribution().then((dist) =>
        dist.map((d) => ({ name: d.name, value: d.count }))
      ),
      this.getAttackTypes().then((types) => types.slice(0, 8)),
      this.getThreatsByMonth(),
      this.getTopThreatSources(5).then((sources) =>
        sources.map((s) => ({ source: s.ip, count: s.count }))
      ),
      this.getThreatTrends(7),
      this.getRecentEvents(10),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      totalThreats,
      activeIncidents: openIncidents,
      criticalAlerts: criticalThreats,
      resolvedThreats,
      threatTrend,
      severityDistribution: severityDist,
      attackTypes,
      topAttackSources: topSources,
      threatsByMonth,
      recentEvents,
      systemHealth: 'healthy',
      totalUsers,
      activeUsers,
    };
  }
}

export const analyticsService = new AnalyticsService();
