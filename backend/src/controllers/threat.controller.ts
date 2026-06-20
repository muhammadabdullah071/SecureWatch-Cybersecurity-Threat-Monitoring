import { Response, NextFunction } from 'express';
import { threatService } from '@/services/threat.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendError, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class ThreatController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const threat = await threatService.create(req.body, req.user!.userId);
      return sendSuccess(res, threat, 'Threat created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await threatService.findAll(req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const threat = await threatService.findById(paramId(req.params.id));
      return sendSuccess(res, threat);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const threat = await threatService.update(paramId(req.params.id), req.body, req.user!.userId);
      return sendSuccess(res, threat, 'Threat updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await threatService.delete(paramId(req.params.id), req.user!.userId);
      return sendSuccess(res, null, 'Threat deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await threatService.getStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const threatController = new ThreatController();
