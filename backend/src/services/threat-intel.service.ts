import prisma from '@/utils/prisma';
import { ApiError } from '@/utils/ApiError';
import { CreateThreatFeedDTO } from '@/types';
import { calculatePagination } from '@/utils/helpers';

export class ThreatIntelService {
  async searchIp(ip: string) {
    const feeds = await prisma.threatFeed.findMany({
      where: {
        type: 'ip',
        value: ip,
        isActive: true,
      },
    });

    const matchedFeed = feeds.length > 0 ? feeds[0] : null;
    const riskScore = matchedFeed ? matchedFeed.riskScore : 0;

    const threatCount = await prisma.threat.count({
      where: { sourceIP: ip },
    });

    return {
      ip,
      isMalicious: feeds.length > 0,
      riskScore,
      matchedFeeds: feeds,
      associatedThreats: threatCount,
      threatSources: feeds.map((f) => f.source),
    };
  }

  async searchDomain(domain: string) {
    const feeds = await prisma.threatFeed.findMany({
      where: {
        type: 'domain',
        value: { contains: domain },
        isActive: true,
      },
    });

    const matchedFeed = feeds.length > 0 ? feeds[0] : null;
    const riskScore = matchedFeed ? matchedFeed.riskScore : 0;

    return {
      domain,
      isMalicious: feeds.length > 0,
      riskScore,
      matchedFeeds: feeds,
    };
  }

  async searchCountry(country: string) {
    const feeds = await prisma.threatFeed.findMany({
      where: {
        type: 'country',
        value: { contains: country },
        isActive: true,
      },
    });

    return {
      country,
      isFlagged: feeds.length > 0,
      feeds,
    };
  }

  async getFeeds(query: any) {
    const { page, limit, type, search, sortBy, sortOrder } = query;

    const where: any = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { value: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const total = await prisma.threatFeed.count({ where });
    const pagination = calculatePagination(page || 1, limit || 10, total);

    const feeds = await prisma.threatFeed.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder || 'desc' },
    });

    return { data: feeds, pagination };
  }

  async createFeed(data: CreateThreatFeedDTO) {
    try {
      const feed = await prisma.threatFeed.create({
        data: {
          type: data.type,
          value: data.value,
          description: data.description || null,
          riskScore: data.riskScore || 50,
          source: data.source || 'internal',
        },
      });
      return feed;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ApiError(409, 'This feed entry already exists');
      }
      throw error;
    }
  }

  async deleteFeed(id: string) {
    const existing = await prisma.threatFeed.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Threat feed entry not found');
    }

    await prisma.threatFeed.delete({ where: { id } });
  }

  async calculateRiskScore(value: string): Promise<number> {
    const feeds = await prisma.threatFeed.findMany({
      where: {
        value: { contains: value },
        isActive: true,
      },
    });

    if (feeds.length === 0) return 0;

    const totalScore = feeds.reduce((sum, feed) => sum + feed.riskScore, 0);
    return Math.min(Math.round(totalScore / feeds.length), 100);
  }

  async getStats() {
    const [typeCounts, topRisk, total] = await Promise.all([
      prisma.threatFeed.groupBy({
        by: ['type'],
        _count: { type: true },
      }),
      prisma.threatFeed.findMany({
        orderBy: { riskScore: 'desc' },
        take: 10,
        select: { value: true, riskScore: true, type: true },
      }),
      prisma.threatFeed.count({ where: { isActive: true } }),
    ]);

    return {
      total,
      byType: typeCounts.reduce((acc, curr) => {
        acc[curr.type] = curr._count.type;
        return acc;
      }, {} as Record<string, number>),
      topRiskScores: topRisk,
    };
  }
}

export const threatIntelService = new ThreatIntelService();
