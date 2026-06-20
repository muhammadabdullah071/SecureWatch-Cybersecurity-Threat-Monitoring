import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError';
import { sendError } from '@/utils/response';
import logger from '@/utils/logger';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Error caught by global handler:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return sendError(res, 'Invalid or expired token', 401);
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500
  );
};

function handlePrismaError(err: Prisma.PrismaClientKnownRequestError, res: Response) {
  switch (err.code) {
    case 'P2002':
      return sendError(res, 'A record with this value already exists', 409);
    case 'P2025':
      return sendError(res, 'Record not found', 404);
    case 'P2003':
      return sendError(res, 'Referenced record not found', 404);
    case 'P2014':
      return sendError(res, 'Constraint violation', 400);
    case 'P2006':
      return sendError(res, 'Invalid data provided', 400);
    default:
      return sendError(res, 'Database error', 500);
  }
}
