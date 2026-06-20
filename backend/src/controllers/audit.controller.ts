import { Response, NextFunction } from 'express';
import { auditService } from '@/services/audit.service';
import { AuthRequest } from '@/types';
import { sendSuccess, sendPaginated } from '@/utils/response';
import { paramId } from '@/utils/params';

export class AuditController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await auditService.findAll(req.query);
      return sendPaginated(res, result.data, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const log = await auditService.findById(paramId(req.params.id));
      return sendSuccess(res, log);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
