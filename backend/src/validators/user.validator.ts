import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number and special character'
    ),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  role: z.enum(['ADMIN', 'ANALYST', 'VIEWER']).optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
