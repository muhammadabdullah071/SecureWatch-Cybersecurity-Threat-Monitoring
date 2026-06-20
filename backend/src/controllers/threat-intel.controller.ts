import { Response, NextFunction } from 'express';
import { threatIntelService } from '@/services/threat-intel.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class ThreatIntelController {
  async searchIp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await threatIntelService.searchIp(paramId(req.params.ip));
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async searchDomain(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await threatIntelService.searchDomain(paramId(req.params.domain));
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async searchCountry(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await threatIntelService.searchCountry(paramId(req.params.country));
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  async getFeeds(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await threatIntelService.getFeeds(req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async createFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const feed = await threatIntelService.createFeed(req.body);
      return sendSuccess(res, feed, 'Threat feed entry created', 201);
    } catch (error) {
      next(error);
    }
  }

  async deleteFeed(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await threatIntelService.deleteFeed(paramId(req.params.id));
      return sendSuccess(res, null, 'Threat feed entry deleted');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await threatIntelService.getStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const threatIntelController = new ThreatIntelController();
