import { Response, NextFunction } from 'express';
import { analyticsService } from '@/services/analytics.service';
import { AuthRequest } from '@/types';
import { sendSuccess } from '@/utils/response';

export class AnalyticsController {
  async getDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getDashboardStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }

  async getThreatsByMonth(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getThreatsByMonth();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getSeverityDistribution(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getSeverityDistribution();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getAttackTypes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getAttackTypes();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getTopThreatSources(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getTopThreatSources(limit);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getResolutionTime(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await analyticsService.getIncidentResolutionTime();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }

  async getThreatTrends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await analyticsService.getThreatTrends(days);
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
