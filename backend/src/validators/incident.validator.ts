import { z } from 'zod';

export const createIncidentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  threatId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export const updateIncidentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(2000).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  threatId: z.string().uuid().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export const incidentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED']).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
