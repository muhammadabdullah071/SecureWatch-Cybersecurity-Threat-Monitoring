import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message: string, statusCode = 500, errors?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: Omit<PaginationMeta, 'hasNextPage' | 'hasPreviousPage'>,
  message = 'Success'
) {
  const meta: PaginationMeta = {
    ...pagination,
    hasNextPage: pagination.page < pagination.totalPages,
    hasPreviousPage: pagination.page > 1,
  };

  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: meta,
  });
}
