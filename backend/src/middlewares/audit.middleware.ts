import { Response, NextFunction } from 'express';
import { AuthRequest } from '@/types';
import { auditService } from '@/services/audit.service';

export const logAction = (action: string, entity: string) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (req.user) {
        const user = req.user;
        const entityId = req.params.id || req.body?.id;

        await auditService.log({
          userId: user.userId,
          userEmail: '',
          action,
          entity,
          entityId,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            body: sanitizeForAudit(req.body),
          }),
          ipAddress: req.ip,
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

function sanitizeForAudit(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = { ...(obj as Record<string, unknown>) };
  if (sanitized.password) sanitized.password = '[REDACTED]';
  if (sanitized.newPassword) sanitized.newPassword = '[REDACTED]';
  if (sanitized.oldPassword) sanitized.oldPassword = '[REDACTED]';
  if (sanitized.token) sanitized.token = '[REDACTED]';
  return sanitized;
}
