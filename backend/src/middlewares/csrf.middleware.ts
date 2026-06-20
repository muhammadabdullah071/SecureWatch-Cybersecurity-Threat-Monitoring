import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ApiError } from '@/utils/ApiError';

const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export const csrfProtection = (req: Request, _res: Response, next: NextFunction) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers[CSRF_HEADER_NAME] as string;

  if (!cookieToken || !headerToken) {
    throw new ApiError(403, 'CSRF token missing');
  }

  if (cookieToken !== headerToken) {
    throw new ApiError(403, 'CSRF token mismatch');
  }

  next();
};

export const generateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  next();
};
