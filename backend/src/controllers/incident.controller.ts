import { Response, NextFunction } from 'express';
import { incidentService } from '@/services/incident.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class IncidentController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentService.create(req.body, req.user!.userId);
      return sendSuccess(res, incident, 'Incident created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await incidentService.findAll(req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentService.findById(paramId(req.params.id));
      return sendSuccess(res, incident);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentService.update(paramId(req.params.id), req.body, req.user!.userId);
      return sendSuccess(res, incident, 'Incident updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async close(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const incident = await incidentService.close(paramId(req.params.id), req.user!.userId);
      return sendSuccess(res, incident, 'Incident closed successfully');
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await incidentService.getStats();
      return sendSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export const incidentController = new IncidentController();
