import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ApiError } from '@/utils/ApiError';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validate = (schemas: ValidationSchemas) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        const apiError = new ApiError(400, 'Validation failed');
        apiError.errors = errorMessages;
        next(apiError);
      } else {
        next(error);
      }
    }
  };
};
